import { Command } from 'commander';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import { LLMService } from '../services/llm.service';
import { TestGeneratorService } from '../services/test-generator.service';
import { CoverageService, CoverageData } from '../services/coverage.service';
import { buildPromptContextFromPaths, getBaseName, readFile, detectLanguage, testExtension } from '../utils/file.utils';

dotenv.config();

const HEADER = chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Pipeline Inteligente de Geração de Testes\n');

function pct(value: number): string {
  if (value >= 80) return chalk.green(`${value}%`);
  if (value >= 60) return chalk.yellow(`${value}%`);
  return chalk.red(`${value}%`);
}

const COLS = ['Statements', 'Branches', 'Functions', 'Lines'];
const COL_W = 12;
const SEP = '─'.repeat(COL_W);

function renderCoverageTable(data: CoverageData): string {
  const vals = [data.statements, data.branches, data.functions, data.lines];
  const top    = `┌${'─'.repeat(14)}┬${COLS.map(() => SEP).join('┬')}┐`;
  const head   = `│ ${chalk.bold('Métrica'.padEnd(13))}│${COLS.map(c => ` ${chalk.bold(c.padEnd(COL_W - 1))}`).join('│')}│`;
  const div    = `├${'─'.repeat(14)}┼${COLS.map(() => SEP).join('┼')}┤`;
  const row    = `│ ${'Cobertura'.padEnd(13)}│${vals.map(v => ` ${pct(v).padEnd(COL_W + 8)}`).join('│')}│`;
  const bottom = `└${'─'.repeat(14)}┴${COLS.map(() => SEP).join('┴')}┘`;
  return [top, head, div, row, bottom].join('\n');
}

function renderCoverageDeltaTable(before: CoverageData, after: CoverageData): string {
  const beforeVals = [before.statements, before.branches, before.functions, before.lines];
  const afterVals  = [after.statements,  after.branches,  after.functions,  after.lines];

  function delta(d: number): string {
    const s = d > 0 ? `+${d}%` : `${d}%`;
    const padded = s.padEnd(COL_W - 1);
    if (d > 0) return chalk.green(padded);
    if (d < 0) return chalk.red(padded);
    return chalk.gray(padded);
  }

  const top      = `┌${'─'.repeat(14)}┬${COLS.map(() => SEP).join('┬')}┐`;
  const head     = `│ ${chalk.bold('Cobertura'.padEnd(13))}│${COLS.map(c => ` ${chalk.bold(c.padEnd(COL_W - 1))}`).join('│')}│`;
  const div      = `├${'─'.repeat(14)}┼${COLS.map(() => SEP).join('┼')}┤`;
  const rowBefore = `│ ${chalk.gray('Antes'.padEnd(13))}│${beforeVals.map(v => ` ${chalk.gray(`${v}%`.padEnd(COL_W - 1))}`).join('│')}│`;
  const rowAfter  = `│ ${'Depois'.padEnd(13)}│${afterVals.map(v => ` ${pct(v).padEnd(COL_W + 8)}`).join('│')}│`;
  const div2     = `├${'─'.repeat(14)}┼${COLS.map(() => SEP).join('┼')}┤`;
  const rowDelta  = `│ ${chalk.bold('Delta'.padEnd(13))}│${afterVals.map((v, i) => ` ${delta(v - beforeVals[i])}`).join('│')}│`;
  const bottom   = `└${'─'.repeat(14)}┴${COLS.map(() => SEP).join('┴')}┘`;
  return [top, head, div, rowBefore, rowAfter, div2, rowDelta, bottom].join('\n');
}

export function buildGenerateCommand(): Command {
  const cmd = new Command('generate');

  cmd
    .description('Generate Jest unit tests from a card description and a source file')
    .requiredOption('--card <text>', 'Card description (feature or task being tested)')
    .requiredOption('--file <path>', 'Path to the source file to generate tests for')
    .option('--context <paths...>', 'Additional files/folders to include as system context for generation')
    .option('--max-context-files <n>', 'Maximum number of context files to include', (v: string) => parseInt(v, 10), 20)
    .option('--max-context-chars <n>', 'Maximum characters per context file', (v: string) => parseInt(v, 10), 4000)
    .option('--max-context-total-chars <n>', 'Maximum total context characters across all context files', (v: string) => parseInt(v, 10), 30000)
    .option('--strict-context', 'Fail if any context input is skipped/truncated/limited by guard rails', false)
    .option('--output <dir>', 'Output directory for the generated tests', 'tests')
    .option('--model <model>', 'OpenAI model to use (overrides OPENAI_MODEL env var)')
    .option('--dry-run', 'Simulate the full pipeline without calling LLM, writing files, or running Jest', false)
    .option('--suggest', 'After running tests, suggest additional test cases based on coverage', false)
    .action(async (opts: {
      card: string;
      file: string;
      output: string;
      model?: string;
      context?: string[];
      maxContextFiles: number;
      maxContextChars: number;
      maxContextTotalChars: number;
      strictContext: boolean;
      dryRun: boolean;
      suggest: boolean;
    }) => {
      console.log(HEADER);

      if (opts.dryRun) {
        console.log(chalk.yellow('🧪 DRY-RUN') + chalk.gray(' — nenhuma chamada externa ou escrita em disco.\n'));
        try {
          const language = detectLanguage(opts.file);
          const source = readFile(opts.file);
          const context = buildPromptContextFromPaths(opts.context ?? [], {
            baseDir: process.cwd(),
            maxFiles: opts.maxContextFiles,
            maxCharsPerFile: opts.maxContextChars,
            maxTotalChars: opts.maxContextTotalChars,
          });
          const sourceLines = source.split(/\r?\n/).length;
          const testFilePath = path.join(opts.output, `${getBaseName(opts.file)}${testExtension(language)}`);
          const modelName = opts.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
          const promptCode = context.promptContext ? `${source}\n\n${context.promptContext}` : source;
          const prompt = LLMService.buildTestPrompt(opts.card, promptCode, language);
          const promptPreview = prompt.split(/\r?\n/).slice(0, 12).join('\n');

          console.log(chalk.bold('Configuração:'));
          console.log(`  ${chalk.cyan('Arquivo fonte  ')} ${opts.file} ${chalk.gray(`(${sourceLines} linhas)`)}`);
          console.log(`  ${chalk.cyan('Linguagem      ')} ${language === 'typescript' ? chalk.blue('TypeScript') : chalk.yellow('JavaScript')}`);
          console.log(`  ${chalk.cyan('Card           ')} ${chalk.gray(`${opts.card.length} caracteres`)}`);
          console.log(`  ${chalk.cyan('Modelo         ')} ${modelName}`);
          console.log(`  ${chalk.cyan('Saída planejada')} ${testFilePath}`);

          if ((opts.context ?? []).length > 0) {
            console.log(`\n${chalk.bold('Contexto:')}`);
            console.log(`  ${chalk.green('✔')} Arquivos incluídos : ${chalk.bold(String(context.usedFiles.length))}`);
            console.log(`  ${chalk.gray('Caracteres totais  :')} ${context.totalCharsIncluded}`);
            if (context.skippedInputs.length > 0) {
              console.log(`  ${chalk.yellow('⚠')} Inputs ignorados   : ${context.skippedInputs.length}`);
            }
            if (context.truncatedFiles.length > 0) {
              console.log(`  ${chalk.yellow('⚠')} Arquivos truncados : ${context.truncatedFiles.length}`);
            }
            if (context.limitedByMaxFiles) {
              console.log(`  ${chalk.yellow('⚠')} Limite de arquivos atingido: ${opts.maxContextFiles}`);
            }

            if (opts.strictContext && hasContextGuardRailViolations(context)) {
              console.error(chalk.red('\n✖ Strict context: execução abortada por violações nos guard rails.'));
              process.exit(1);
            }
          }

          console.log(`\n${chalk.bold('Etapas planejadas:')}`);
          const steps = [
            'Construir prompt LLM com card + código fonte',
            'Chamar LLM para gerar testes Jest',
            'Salvar testes no diretório de saída',
            'Executar Jest com cobertura',
          ];
          if (opts.suggest) steps.push('Sugerir testes adicionais com base nos gaps de cobertura');
          steps.forEach((s, i) => console.log(`  ${chalk.gray(`${i + 1}.`)} ${s}`));

          console.log(`\n${chalk.bold('Prévia do prompt')} ${chalk.gray(`(${prompt.length} chars, primeiras 12 linhas):`)}`);
          console.log(chalk.gray('─'.repeat(60)));
          console.log(chalk.italic(promptPreview));
          if (prompt.split(/\r?\n/).length > 12) console.log(chalk.gray('...'));
          console.log(chalk.gray('─'.repeat(60)));

          console.log(chalk.green('\n✔ Dry-run concluído. Nenhum arquivo criado.\n'));
          process.exit(0);
        } catch (err: unknown) {
          console.error(chalk.red(`✖ Dry-run falhou: ${(err as Error).message}`));
          process.exit(1);
        }
      }

      // 1. Initialise services
      let llm: LLMService;
      try {
        llm = new LLMService({ model: opts.model });
      } catch (err: unknown) {
        console.error(chalk.red(`✖ ${(err as Error).message}`));
        process.exit(1);
      }

      const generator = new TestGeneratorService(llm);
      const coverage = new CoverageService(process.cwd());

      // 2. Capture baseline coverage BEFORE generating new tests
      const spinnerBaseline = ora({ text: chalk.gray('Capturando cobertura atual (baseline)…'), spinner: 'dots' }).start();
      coverage.runWithCoverage(); // run existing tests so coverage-summary.json is fresh
      const beforeCoverage = coverage.readCoverageForFile(opts.file) ?? { statements: 0, branches: 0, functions: 0, lines: 0 };
      spinnerBaseline.succeed(
        chalk.gray(`Baseline: ${beforeCoverage.statements}% stmts · ${beforeCoverage.branches}% branches · ${beforeCoverage.functions}% funcs · ${beforeCoverage.lines}% lines`),
      );

      // 3. Generate tests (with streaming token counter)
      const spinnerGen = ora({
        text: chalk.gray(`Conectando ao LLM (${llm.model})…`),
        spinner: 'dots',
      }).start();

      let tokenCount = 0;
      let result;
      try {
        result = await generator.generate({
          card: opts.card,
          filePath: opts.file,
          outputDir: opts.output,
          contextPaths: opts.context,
          maxContextFiles: opts.maxContextFiles,
          maxContextCharsPerFile: opts.maxContextChars,
          maxContextTotalChars: opts.maxContextTotalChars,
          onToken: () => {
            tokenCount++;
            spinnerGen.text = chalk.gray(`Gerando testes… `) + chalk.dim(`${tokenCount} tokens`);
          },
        });
        spinnerGen.succeed(
          chalk.green('Testes gerados!') + chalk.gray(` (${tokenCount} tokens · ${llm.model})`),
        );
      } catch (err: unknown) {
        spinnerGen.fail(chalk.red(`Geração falhou: ${(err as Error).message}`));
        process.exit(1);
      }

      console.log(`  ${chalk.cyan('Arquivo   ')} ${result.testFilePath}`);
      console.log(`  ${chalk.cyan('Linguagem ')} ${result.language === 'typescript' ? chalk.blue('TypeScript') : chalk.yellow('JavaScript')}`);
      console.log(`  ${chalk.cyan('Testes    ')} ${chalk.bold(String(result.testCount))} caso(s) encontrado(s)`);

      if (result.usedContextFiles.length > 0) {
        console.log(`  ${chalk.cyan('Contexto')} ${result.usedContextFiles.length} arquivo(s) incluído(s)`);
      }
      const contextWarnings: string[] = [];
      if (result.skippedContextInputs.length > 0) contextWarnings.push(`${result.skippedContextInputs.length} input(s) ignorado(s)`);
      if (result.truncatedContextFiles.length > 0) contextWarnings.push(`${result.truncatedContextFiles.length} arquivo(s) truncado(s)`);
      if (result.limitedByMaxContextFiles) contextWarnings.push(`limite de arquivos (${opts.maxContextFiles}) atingido`);
      if (contextWarnings.length > 0) {
        console.log(`  ${chalk.yellow('⚠')} Contexto: ${contextWarnings.join(' · ')}`);
      }

      if (opts.strictContext && hasGenerationContextViolations(result)) {
        console.error(chalk.red('\n✖ Strict context: execução abortada por violações nos guard rails.'));
        process.exit(1);
      }

      // 4. Validate TypeScript (only for .ts files — catches LLM hallucinations before Jest runs)
      if (result.language === 'typescript') {
        const spinnerValidate = ora({ text: chalk.gray('Validando TypeScript gerado…'), spinner: 'dots' }).start();
        const validation = coverage.validateGeneratedFile(result.testFilePath);
        if (validation.valid) {
          spinnerValidate.succeed(chalk.green('TypeScript válido — nenhum erro de tipo.'));
        } else {
          spinnerValidate.warn(chalk.yellow('Avisos de TypeScript (o Jest vai tentar mesmo assim):'));
          console.log(chalk.gray(validation.errors));
        }
      }

      // 5. Run tests with coverage
      console.log('');
      const spinnerRun = ora({ text: chalk.gray('Executando Jest com cobertura…'), spinner: 'dots' }).start();
      const runResult = coverage.runWithCoverage();
      const afterCoverage = coverage.readCoverageForFile(opts.file);

      if (runResult.success) {
        spinnerRun.succeed(chalk.green('Testes executados com sucesso!'));
      } else {
        spinnerRun.fail(chalk.red('Falha na execução dos testes.'));
      }

      console.log('');
      if (afterCoverage) {
        console.log(renderCoverageDeltaTable(beforeCoverage, afterCoverage));
      } else if (runResult.coverageData) {
        console.log(renderCoverageTable(runResult.coverageData));
      } else {
        console.log(chalk.gray(runResult.coverageSummary));
      }
      console.log('');

      if (!runResult.success) {
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.bold('Saída do Jest:'));
        console.log(chalk.gray(runResult.output));
        console.log(chalk.gray('─'.repeat(60)));
      }

      // 4. Optionally suggest additional tests
      if (opts.suggest) {
        const spinnerSug = ora({ text: chalk.gray('Analisando gaps de cobertura…'), spinner: 'dots' }).start();
        try {
          const code = readFile(opts.file);
          const suggestionPrompt = llm.buildCoverageSuggestionPrompt(opts.card, code, runResult.coverageSummary);
          const suggestions = await llm.complete(suggestionPrompt);
          spinnerSug.succeed(chalk.green('Sugestões geradas!'));
          console.log(chalk.gray('─'.repeat(60)));
          console.log(chalk.bold('\nTestes adicionais sugeridos:'));
          console.log(suggestions);
          console.log(chalk.gray('─'.repeat(60)));
        } catch (err: unknown) {
          spinnerSug.warn(chalk.yellow(`Não foi possível gerar sugestões: ${(err as Error).message}`));
        }
      }

      console.log(chalk.bold.cyan('\n⚡ Pipeline concluído.\n'));
      process.exit(runResult.success ? 0 : 1);
    });

  return cmd;
}

function hasContextGuardRailViolations(context: {
  skippedInputs: string[];
  skippedByExtensionFiles: string[];
  skippedBinaryFiles: string[];
  truncatedFiles: string[];
  limitedByMaxFiles: boolean;
  limitedByMaxTotalChars: boolean;
}): boolean {
  return (
    context.skippedInputs.length > 0 ||
    context.skippedByExtensionFiles.length > 0 ||
    context.skippedBinaryFiles.length > 0 ||
    context.truncatedFiles.length > 0 ||
    context.limitedByMaxFiles ||
    context.limitedByMaxTotalChars
  );
}

function hasGenerationContextViolations(result: {
  skippedContextInputs: string[];
  skippedByExtensionContextFiles: string[];
  skippedBinaryContextFiles: string[];
  truncatedContextFiles: string[];
  limitedByMaxContextFiles: boolean;
  limitedByMaxTotalContextChars: boolean;
}): boolean {
  return (
    result.skippedContextInputs.length > 0 ||
    result.skippedByExtensionContextFiles.length > 0 ||
    result.skippedBinaryContextFiles.length > 0 ||
    result.truncatedContextFiles.length > 0 ||
    result.limitedByMaxContextFiles ||
    result.limitedByMaxTotalContextChars
  );
}
