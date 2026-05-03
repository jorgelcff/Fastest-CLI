import { Command } from 'commander';
import readline from 'readline';
import chalk from 'chalk';
import {
  readConfig,
  writeConfig,
  clearConfig,
  maskKey,
  getConfigPath,
  resolveApiKey,
} from '../config/config.manager';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function buildConfigCommand(): Command {
  const cmd = new Command('config');
  cmd.description('Manage Fastest CLI global configuration (~/.fastest/config.json)');

  // ── set-key ─────────────────────────────────────────────────────────────────
  cmd
    .command('set-key')
    .description('Save your OpenAI API key to the global config')
    .action(async () => {
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Configurar chave da API\n'));
      console.log(chalk.gray('A chave será salva em: ') + chalk.white(getConfigPath()));
      console.log(chalk.gray('Permissão do arquivo: 600 (somente seu usuário pode ler)\n'));
      console.log(chalk.gray('Obtenha sua chave em: https://platform.openai.com/api-keys\n'));

      const key = await prompt(chalk.cyan('Cole sua OpenAI API Key: '));

      if (!key) {
        console.log(chalk.red('\n✖ Nenhuma chave informada. Operação cancelada.\n'));
        process.exit(1);
      }

      if (!key.startsWith('sk-')) {
        const proceed = await prompt(
          chalk.yellow('⚠  A chave não começa com "sk-". Salvar mesmo assim? (s/N): '),
        );
        if (proceed.toLowerCase() !== 's') {
          console.log(chalk.gray('\nOperação cancelada.\n'));
          process.exit(0);
        }
      }

      const current = readConfig();
      writeConfig({ ...current, openaiApiKey: key });

      console.log(chalk.green('\n✔ Chave salva com sucesso!'));
      console.log(`  ${chalk.cyan('Chave  ')} ${maskKey(key)}`);
      console.log(`  ${chalk.cyan('Arquivo')} ${getConfigPath()}\n`);
      console.log(chalk.gray('Para verificar: ') + chalk.white('fastest config show'));
      console.log(chalk.gray('Para testar   : ') + chalk.white('fastest doctor\n'));
    });

  // ── show ────────────────────────────────────────────────────────────────────
  cmd
    .command('show')
    .description('Show current global configuration')
    .action(() => {
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Configuração atual\n'));

      const config = readConfig();
      const resolved = resolveApiKey();

      console.log(`${chalk.bold('Arquivo:')} ${chalk.gray(getConfigPath())}\n`);

      // API key
      if (config.openaiApiKey) {
        console.log(`  ${chalk.green('✔')} ${chalk.cyan('API Key (global config)')} ${maskKey(config.openaiApiKey)}`);
      } else {
        console.log(`  ${chalk.gray('–')} ${chalk.gray('API Key (global config)')} ${chalk.gray('não configurada')}`);
      }

      if (process.env.OPENAI_API_KEY) {
        console.log(`  ${chalk.green('✔')} ${chalk.cyan('API Key (env var)      ')} ${maskKey(process.env.OPENAI_API_KEY)}`);
      }

      // Model
      const model = config.openaiModel ?? process.env.OPENAI_MODEL ?? chalk.gray('gpt-4o-mini (padrão)');
      console.log(`  ${chalk.cyan('Modelo                ')} ${model}`);

      // Effective key
      console.log('');
      if (resolved) {
        const sourceLabel: Record<typeof resolved.source, string> = {
          option: 'argumento CLI',
          env:    'variável de ambiente',
          config: 'config global (~/.fastest)',
        };
        console.log(`${chalk.bold('Chave ativa:')} ${maskKey(resolved.key)} ${chalk.gray(`(fonte: ${sourceLabel[resolved.source]})`)}`);
      } else {
        console.log(chalk.yellow('⚠  Nenhuma API key configurada. Execute: ') + chalk.white('fastest config set-key'));
      }
      console.log('');
    });

  // ── set-model ───────────────────────────────────────────────────────────────
  cmd
    .command('set-model <model>')
    .description('Set default OpenAI model (e.g. gpt-4o, gpt-4o-mini)')
    .action((model: string) => {
      const current = readConfig();
      writeConfig({ ...current, openaiModel: model });
      console.log(chalk.green(`\n✔ Modelo padrão salvo: ${chalk.bold(model)}\n`));
    });

  // ── clear ───────────────────────────────────────────────────────────────────
  cmd
    .command('clear')
    .description('Remove all stored configuration')
    .action(async () => {
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Limpar configuração\n'));

      const config = readConfig();
      if (!config.openaiApiKey && !config.openaiModel) {
        console.log(chalk.gray('Nenhuma configuração encontrada. Nada a remover.\n'));
        process.exit(0);
      }

      const confirm = await prompt(
        chalk.yellow(`⚠  Isso removerá ${getConfigPath()}\n   Confirma? (s/N): `),
      );
      if (confirm.toLowerCase() !== 's') {
        console.log(chalk.gray('\nOperação cancelada.\n'));
        process.exit(0);
      }

      clearConfig();
      console.log(chalk.green('\n✔ Configuração removida.\n'));
    });

  return cmd;
}
