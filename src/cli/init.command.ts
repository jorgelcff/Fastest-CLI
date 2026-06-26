import { Command } from 'commander';
import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { writeConfig, readConfig } from '../config/config.manager';
import { detectTestFramework } from '../utils/file.utils';

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

function askChoice(rl: readline.Interface, question: string, options: string[], defaultIndex: number = 0): Promise<string> {
  return new Promise(resolve => {
    console.log(question);
    options.forEach((opt, i) => {
      const marker = i === defaultIndex ? chalk.cyan('→') : ' ';
      console.log(`  ${marker} ${i + 1}. ${opt}`);
    });
    rl.question(chalk.gray(`  Escolha [${defaultIndex + 1}]: `), (answer) => {
      const idx = parseInt(answer, 10) - 1;
      resolve(options[idx >= 0 && idx < options.length ? idx : defaultIndex]);
    });
  });
}

export function buildInitCommand(): Command {
  const cmd = new Command('init');

  cmd
    .description('Interactive setup wizard for Fastest CLI')
    .action(async () => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Setup Wizard\n'));
      console.log(chalk.gray('Vamos configurar o Fastest CLI para o seu projeto.\n'));

      try {
        // 1. Detect project info
        const cwd = process.cwd();
        const pkgPath = path.join(cwd, 'package.json');

        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          console.log(`  ${chalk.green('✔')} Projeto detectado: ${chalk.bold(pkg.name ?? 'unknown')}`);
        } else {
          console.log(`  ${chalk.yellow('⚠')} Nenhum package.json encontrado.`);
        }

        // 2. Detect test framework
        const detectedFramework = detectTestFramework(cwd);
        console.log(`  ${chalk.green('✔')} Framework de teste: ${chalk.bold(detectedFramework)}`);

        // 3. Choose LLM provider
        console.log('');
        const provider = await askChoice(
          rl,
          chalk.bold('Qual provedor LLM você quer usar?'),
          ['OpenAI (gpt-4o-mini)', 'Anthropic (claude-haiku)'],
          0,
        );
        const isAnthropic = provider.includes('Anthropic');
        const envVarName = isAnthropic ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
        const defaultModel = isAnthropic ? 'claude-haiku-4-5-20251001' : 'gpt-4o-mini';

        // 4. Get API key
        console.log('');
        const apiKey = await ask(rl, chalk.bold(`${envVarName}: `));

        if (apiKey.trim()) {
          const config = readConfig();
          if (isAnthropic) {
            config.anthropicApiKey = apiKey.trim();
          } else {
            config.openaiApiKey = apiKey.trim();
          }
          config.openaiModel = defaultModel;
          writeConfig(config);
          console.log(`  ${chalk.green('✔')} API key salva em ${chalk.gray('~/.fastest/config.json')}`);
        } else {
          console.log(`  ${chalk.yellow('⚠')} Nenhuma API key fornecida. Configure depois com: ${chalk.cyan(`fastest config set-key --provider ${isAnthropic ? 'anthropic' : 'openai'}`)}`);
        }

        // 5. Create .env if it doesn't exist
        const envPath = path.join(cwd, '.env');
        const envExamplePath = path.join(cwd, '.env.example');
        if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
          const envContent = fs.readFileSync(envExamplePath, 'utf-8');
          let updatedContent = envContent;
          if (apiKey.trim()) {
            updatedContent = updatedContent.replace(
              /^(OPENAI_API_KEY|ANTHROPIC_API_KEY)=.*$/m,
              `${envVarName}=${apiKey.trim()}`,
            );
          }
          fs.writeFileSync(envPath, updatedContent, 'utf-8');
          console.log(`  ${chalk.green('✔')} .env criado a partir de .env.example`);
        }

        // 6. Summary
        console.log(chalk.bold('\n─── Configuração ───'));
        console.log(`  ${chalk.cyan('Provedor:')} ${isAnthropic ? 'Anthropic' : 'OpenAI'}`);
        console.log(`  ${chalk.cyan('Modelo:')} ${defaultModel}`);
        console.log(`  ${chalk.cyan('Framework:')} ${detectedFramework}`);
        console.log(`  ${chalk.cyan('API Key:')} ${apiKey.trim() ? chalk.green('configurada') : chalk.yellow('pendente')}`);

        console.log(chalk.bold('\n─── Próximos passos ───'));
        console.log(`  1. ${chalk.cyan('fastest doctor')} — verificar o ambiente`);
        console.log(`  2. ${chalk.cyan('fastest generate --card "..." --file src/foo.ts')} — gerar testes`);
        console.log(`  3. ${chalk.cyan('fastest batch --card "..." --files src/')} — gerar testes em lote`);

        console.log(chalk.bold.cyan('\n⚡ Setup concluído!\n'));
      } finally {
        rl.close();
      }
    });

  return cmd;
}
