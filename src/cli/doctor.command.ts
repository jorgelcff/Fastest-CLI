import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { buildPromptContextFromPaths } from '../utils/file.utils';
import { resolveApiKeyForProvider, maskKey, getConfigPath, readConfig } from '../config/config.manager';
import { detectProvider } from '../providers/provider.factory';

export function buildDoctorCommand(): Command {
  const cmd = new Command('doctor');

  cmd
    .description('Validate target project environment and prerequisites for Fastest CLI')
    .option('--cwd <dir>', 'Directory of the target project', process.cwd())
    .option('--context <paths...>', 'Additional files/folders to validate with context guard rails')
    .option('--max-context-files <n>', 'Maximum number of context files to include', (v: string) => parseInt(v, 10), 20)
    .option('--max-context-chars <n>', 'Maximum characters per context file', (v: string) => parseInt(v, 10), 4000)
    .option('--max-context-total-chars <n>', 'Maximum total context characters across all context files', (v: string) => parseInt(v, 10), 30000)
    .option('--strict-context', 'Fail if any context guard rail warning is found', false)
    .action((opts: {
      cwd: string;
      context?: string[];
      maxContextFiles: number;
      maxContextChars: number;
      maxContextTotalChars: number;
      strictContext: boolean;
    }) => {
      const root = path.resolve(opts.cwd);
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Doctor\n'));
      console.log(chalk.gray(`Verificando: ${root}\n`));

      const checks: Array<{ name: string; ok: boolean; hint?: string }> = [];

      // 1. package.json exists
      const pkgPath = path.join(root, 'package.json');
      const pkgExists = fs.existsSync(pkgPath);
      checks.push({
        name: 'package.json presente',
        ok: pkgExists,
        hint: 'Execute `npm init` ou garanta que package.json existe',
      });

      // 2. jest.config.js or jest script
      let hasJest = false;
      const jestConfig = fs.existsSync(path.join(root, 'jest.config.js')) || fs.existsSync(path.join(root, 'jest.config.cjs'));
      if (pkgExists) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          hasJest = Boolean(pkg.scripts && (pkg.scripts.test || pkg.scripts['test:coverage']));
        } catch {}
      }
      checks.push({
        name: 'Jest configurado (script ou arquivo de config)',
        ok: jestConfig || hasJest,
        hint: 'Instale Jest (npm i -D jest) ou adicione um script test no package.json',
      });

      // 3. tsconfig.json exists (TypeScript project)
      const tsconfig = fs.existsSync(path.join(root, 'tsconfig.json'));
      checks.push({
        name: 'tsconfig.json presente',
        ok: tsconfig,
        hint: 'Para TypeScript, adicione tsconfig.json (npx tsc --init)',
      });

      // 4. Node version
      const nodeVer = process.version.replace(/^v/, '');
      const major = parseInt(nodeVer.split('.')[0], 10) || 0;
      const nodeOk = major >= 18;
      checks.push({
        name: `Node.js >=18 ${chalk.gray(`(detectado ${process.version})`)}`,
        ok: nodeOk,
        hint: 'Atualize o Node.js para v18 ou superior',
      });

      // 5. .env file exists
      const envPath = path.join(root, '.env');
      const envExists = fs.existsSync(envPath);
      checks.push({
        name: '.env presente',
        ok: envExists,
        hint: 'Execute `npm run setup` ou copie .env.example para .env e preencha OPENAI_API_KEY',
      });

      // 6. API key — check for the active provider (detected from configured model)
      const activeModel    = readConfig().openaiModel ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const activeProvider = detectProvider(activeModel);
      const envVarName     = activeProvider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';

      let keyIsPlaceholder = false;
      if (envExists) {
        try {
          const envContent = fs.readFileSync(envPath, 'utf-8');
          const match = envContent.match(new RegExp(`^${envVarName}=(.*)$`, 'm'));
          const val = match ? match[1].trim() : '';
          keyIsPlaceholder = val === 'your_openai_api_key_here' || val === '';
        } catch {}
      }
      const resolved   = resolveApiKeyForProvider(activeProvider);
      const apiKeyOk   = resolved !== null && !keyIsPlaceholder;
      const sourceLabel: Record<string, string> = {
        env:    '.env / variável de ambiente',
        config: `config global (${getConfigPath()})`,
        option: 'argumento CLI',
      };
      const keyName = apiKeyOk && resolved
        ? `${envVarName} ${chalk.gray(`[${maskKey(resolved.key)}] via ${sourceLabel[resolved.source]}`)}`
        : `${envVarName} configurada ${chalk.gray(`(provedor: ${activeProvider})`)}`;
      checks.push({
        name: keyName,
        ok: apiKeyOk,
        hint: keyIsPlaceholder
          ? `Substitua o placeholder em .env com sua chave real`
          : `Execute \`fastest config set-key --provider ${activeProvider}\` ou defina ${envVarName} no .env`,
      });

      // Print checks
      let allOk = true;
      checks.forEach((c) => {
        if (c.ok) {
          console.log(`  ${chalk.green('✔')} ${c.name}`);
        } else {
          allOk = false;
          console.log(`  ${chalk.red('✖')} ${c.name}`);
          if (c.hint) console.log(`    ${chalk.gray('→')} ${chalk.gray(c.hint)}`);
        }
      });

      // Context guard rails
      let hasContextIssues = false;
      if ((opts.context ?? []).length > 0) {
        const context = buildPromptContextFromPaths(opts.context ?? [], {
          baseDir: root,
          maxFiles: opts.maxContextFiles,
          maxCharsPerFile: opts.maxContextChars,
          maxTotalChars: opts.maxContextTotalChars,
        });

        console.log(`\n${chalk.bold('Guard Rails de Contexto:')}`);
        console.log(`  ${chalk.green('✔')} Arquivos incluídos : ${chalk.bold(String(context.usedFiles.length))}`);
        console.log(`  ${chalk.gray('Caracteres totais  :')} ${context.totalCharsIncluded}`);

        if (context.skippedInputs.length > 0) {
          hasContextIssues = true;
          console.log(`  ${chalk.yellow('⚠')} Inputs ignorados           : ${context.skippedInputs.join(', ')}`);
        }
        if (context.skippedByExtensionFiles.length > 0) {
          hasContextIssues = true;
          console.log(`  ${chalk.yellow('⚠')} Arquivos ignorados (ext)    : ${context.skippedByExtensionFiles.join(', ')}`);
        }
        if (context.skippedBinaryFiles.length > 0) {
          hasContextIssues = true;
          console.log(`  ${chalk.yellow('⚠')} Arquivos binários ignorados : ${context.skippedBinaryFiles.join(', ')}`);
        }
        if (context.truncatedFiles.length > 0) {
          hasContextIssues = true;
          console.log(`  ${chalk.yellow('⚠')} Arquivos truncados          : ${context.truncatedFiles.join(', ')}`);
        }
        if (context.limitedByMaxFiles) {
          hasContextIssues = true;
          console.log(`  ${chalk.yellow('⚠')} Limite de arquivos atingido : ${opts.maxContextFiles}`);
        }
        if (context.limitedByMaxTotalChars) {
          hasContextIssues = true;
          console.log(`  ${chalk.yellow('⚠')} Limite total de chars atingido : ${opts.maxContextTotalChars}`);
        }
      }

      // Summary
      console.log('');
      if (allOk && (!opts.strictContext || !hasContextIssues)) {
        console.log(chalk.green('✔ ') + chalk.bold('Ambiente pronto para o Fastest CLI.') + '\n');
        process.exit(0);
      } else {
        if (opts.strictContext && hasContextIssues) {
          console.log(chalk.yellow('⚠ ') + chalk.bold('Strict context: avisos de guard rail encontrados.') + '\n');
        } else {
          console.log(chalk.yellow('⚠ ') + chalk.bold('Algumas verificações falharam. Siga as dicas acima.') + '\n');
        }
        process.exit(2);
      }
    });

  return cmd;
}
