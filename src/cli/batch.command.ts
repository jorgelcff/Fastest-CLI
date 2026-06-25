import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { LLMService, TestType } from '../services/llm.service';
import { TestGeneratorService } from '../services/test-generator.service';
import { detectTestFramework, TestFramework } from '../utils/file.utils';

dotenv.config();

interface BatchResult {
  file: string;
  success: boolean;
  testFilePath?: string;
  testCount?: number;
  error?: string;
}

function resolveFiles(patterns: string[]): string[] {
  const files: string[] = [];
  const skipPatterns = /\.(spec|test)\.(ts|js|tsx|jsx)$/;
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'coverage']);

  for (const pattern of patterns) {
    const abs = path.resolve(pattern);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile() && !skipPatterns.test(abs)) {
      files.push(abs);
    } else if (stat.isDirectory()) {
      walkDir(abs, files, skipPatterns, ignoreDirs);
    }
  }
  return [...new Set(files)].sort();
}

function walkDir(dir: string, files: string[], skipPatterns: RegExp, ignoreDirs: Set<string>) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) walkDir(full, files, skipPatterns, ignoreDirs);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext) && !skipPatterns.test(entry.name)) {
        files.push(full);
      }
    }
  }
}

function parseTestType(value: string): TestType {
  const normalized = (value || '').toLowerCase().trim();
  if (normalized === 'integration' || normalized === 'unit') return normalized;
  throw new Error(`Invalid --test-type "${value}". Use "unit" or "integration".`);
}

export function buildBatchCommand(): Command {
  const cmd = new Command('batch');
  cmd
    .description('Generate tests for multiple source files at once')
    .requiredOption('--card <text>', 'Card description shared across all files')
    .requiredOption('--files <patterns...>', 'Source file paths or directories')
    .option('--test-type <type>', 'Test type: unit | integration', 'unit')
    .option('--output <dir>', 'Output directory for generated tests', 'tests')
    .option('--model <model>', 'LLM model to use')
    .option('--retries <n>', 'Retry attempts per file if tests fail validation', (v: string) => parseInt(v, 10), 0)
    .option('--concurrency <n>', 'Number of files to process', (v: string) => parseInt(v, 10), 0)
    .option('--framework <framework>', 'Test framework: jest | vitest | auto', 'auto')
    .option('--dry-run', 'List matched files without generating tests', false)
    .option('--cache', 'Cache LLM responses to avoid redundant API calls', false)
    .action(async (opts) => {
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Batch Mode\n'));

      const parsedTestType = parseTestType(opts.testType);
      const framework: TestFramework = opts.framework === 'vitest' ? 'vitest'
        : opts.framework === 'jest' ? 'jest'
        : detectTestFramework();
      const files = resolveFiles(opts.files);

      if (files.length === 0) {
        console.log(chalk.yellow('Nenhum arquivo fonte encontrado.'));
        process.exit(0);
      }

      const filesToProcess = opts.concurrency > 0 ? files.slice(0, opts.concurrency) : files;

      console.log(chalk.bold(`${filesToProcess.length} arquivo(s) encontrado(s):\n`));
      filesToProcess.forEach(f => console.log(`  ${chalk.gray('•')} ${path.relative(process.cwd(), f)}`));
      console.log('');

      if (opts.dryRun) {
        console.log(chalk.yellow('🧪 DRY-RUN — nenhum teste será gerado.\n'));
        process.exit(0);
      }

      let llm: LLMService;
      try {
        llm = new LLMService({ model: opts.model, cache: opts.cache });
      } catch (err: unknown) {
        console.error(chalk.red(`✖ ${(err as Error).message}`));
        process.exit(1);
      }

      const generator = new TestGeneratorService(llm);
      const results: BatchResult[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const rel = path.relative(process.cwd(), file);
        const spinner = ora({
          text: chalk.gray(`[${i + 1}/${filesToProcess.length}] Gerando testes para ${rel}…`),
          spinner: 'dots',
        }).start();

        try {
          const result = await generator.generate({
            card: opts.card,
            filePath: file,
            testType: parsedTestType,
            framework,
            outputDir: opts.output,
            maxRetries: opts.retries,
          });
          spinner.succeed(
            chalk.green(`[${i + 1}/${filesToProcess.length}]`) +
            ` ${rel} → ${chalk.bold(String(result.testCount))} teste(s)`,
          );
          results.push({
            file: rel,
            success: true,
            testFilePath: result.testFilePath,
            testCount: result.testCount,
          });
        } catch (err: unknown) {
          spinner.fail(
            chalk.red(`[${i + 1}/${filesToProcess.length}]`) + ` ${rel} — ${(err as Error).message}`,
          );
          results.push({ file: rel, success: false, error: (err as Error).message });
        }
      }

      // Summary
      const succeeded = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const totalTests = succeeded.reduce((sum, r) => sum + (r.testCount ?? 0), 0);

      console.log(chalk.bold('\n─── Resumo ───'));
      console.log(`  ${chalk.cyan('Arquivos processados:')} ${results.length}`);
      console.log(`  ${chalk.green('Sucesso:')} ${succeeded.length}`);
      if (failed.length > 0) {
        console.log(`  ${chalk.red('Falhas:')} ${failed.length}`);
      }
      console.log(`  ${chalk.cyan('Total de testes:')} ${totalTests}`);

      if (failed.length > 0) {
        console.log(chalk.bold('\nArquivos com falha:'));
        failed.forEach(r => {
          console.log(`  ${chalk.red('✖')} ${r.file}: ${chalk.gray(r.error ?? 'Unknown error')}`);
        });
      }

      console.log(chalk.bold.cyan('\n⚡ Batch concluído.\n'));
      process.exit(failed.length > 0 ? 1 : 0);
    });

  return cmd;
}
