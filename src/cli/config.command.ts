import { Command } from 'commander';
import readline from 'readline';
import chalk from 'chalk';
import {
  readConfig,
  writeConfig,
  clearConfig,
  maskKey,
  getConfigPath,
  resolveApiKeyForProvider,
  type Provider,
} from '../config/config.manager';
import { detectProvider } from '../providers/provider.factory';

const KEY_HINTS: Record<Provider, string> = {
  openai:    'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
};

const CONFIG_FIELD: Record<Provider, 'openaiApiKey' | 'anthropicApiKey'> = {
  openai:    'openaiApiKey',
  anthropic: 'anthropicApiKey',
};

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

export function buildConfigCommand(): Command {
  const cmd = new Command('config');
  cmd.description('Manage Fastest CLI global configuration (~/.fastest/config.json)');

  // ── set-key ─────────────────────────────────────────────────────────────────
  cmd
    .command('set-key')
    .description('Save an API key to the global config (OpenAI or Anthropic)')
    .option('--provider <name>', 'Provider: openai or anthropic', 'openai')
    .action(async (opts: { provider: string }) => {
      const provider = opts.provider as Provider;
      if (provider !== 'openai' && provider !== 'anthropic') {
        console.error(chalk.red(`✖ Provedor inválido: "${opts.provider}". Use openai ou anthropic.\n`));
        process.exit(1);
      }

      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(` — Configurar chave (${provider})\n`));
      console.log(chalk.gray('Arquivo: ') + chalk.white(getConfigPath()));
      console.log(chalk.gray('Obtenha sua chave em: ') + chalk.white(KEY_HINTS[provider]) + '\n');

      const key = await prompt(chalk.cyan(`Cole sua ${provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} API Key: `));

      if (!key) {
        console.log(chalk.red('\n✖ Nenhuma chave informada. Operação cancelada.\n'));
        process.exit(1);
      }

      if (!key.startsWith('sk-')) {
        const proceed = await prompt(chalk.yellow('⚠  A chave não começa com "sk-". Salvar mesmo assim? (s/N): '));
        if (proceed.toLowerCase() !== 's') {
          console.log(chalk.gray('\nOperação cancelada.\n'));
          process.exit(0);
        }
      }

      writeConfig({ ...readConfig(), [CONFIG_FIELD[provider]]: key });

      console.log(chalk.green('\n✔ Chave salva!'));
      console.log(`  ${chalk.cyan('Provedor')} ${provider}`);
      console.log(`  ${chalk.cyan('Chave   ')} ${maskKey(key)}`);
      console.log(`  ${chalk.cyan('Arquivo ')} ${getConfigPath()}\n`);
      console.log(chalk.gray('Verificar: ') + chalk.white('fastest config show'));
      console.log(chalk.gray('Testar   : ') + chalk.white('fastest doctor\n'));
    });

  // ── show ────────────────────────────────────────────────────────────────────
  cmd
    .command('show')
    .description('Show current global configuration')
    .action(() => {
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Configuração atual\n'));
      const config  = readConfig();
      const model   = config.openaiModel ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      const activeProvider = detectProvider(model);
      const resolved = resolveApiKeyForProvider(activeProvider);

      console.log(`${chalk.bold('Arquivo:')} ${chalk.gray(getConfigPath())}\n`);

      const providers: Provider[] = ['openai', 'anthropic'];
      for (const p of providers) {
        const stored = config[CONFIG_FIELD[p]];
        const envVal = process.env[p === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'];
        const icon = stored || envVal ? chalk.green('✔') : chalk.gray('–');
        const display = stored ? maskKey(stored) : envVal ? `${maskKey(envVal)} ${chalk.gray('(env)')}` : chalk.gray('não configurada');
        console.log(`  ${icon} ${chalk.cyan(p.padEnd(10))} ${display}`);
      }

      console.log(`  ${chalk.cyan('Modelo    ')} ${model} ${chalk.gray(`→ ${activeProvider}`)}`);
      console.log('');

      if (resolved) {
        const src: Record<string, string> = { option: 'argumento CLI', env: 'variável de ambiente', config: 'config global' };
        console.log(`${chalk.bold('Chave ativa:')} ${maskKey(resolved.key)} ${chalk.gray(`(${src[resolved.source]})`)} `);
      } else {
        console.log(chalk.yellow(`⚠  Nenhuma chave para "${activeProvider}". Execute: `) + chalk.white(`fastest config set-key --provider ${activeProvider}`));
      }
      console.log('');
    });

  // ── set-model ───────────────────────────────────────────────────────────────
  cmd
    .command('set-model <model>')
    .description('Set default model (e.g. gpt-4o-mini, claude-haiku-4-5-20251001)')
    .action((model: string) => {
      writeConfig({ ...readConfig(), openaiModel: model });
      const provider = detectProvider(model);
      console.log(chalk.green(`\n✔ Modelo padrão: ${chalk.bold(model)} ${chalk.gray(`(${provider})`)}\n`));
    });

  // ── clear ───────────────────────────────────────────────────────────────────
  cmd
    .command('clear')
    .description('Remove all stored configuration')
    .action(async () => {
      console.log(chalk.bold.cyan('\n⚡ Fastest CLI') + chalk.gray(' — Limpar configuração\n'));
      const config = readConfig();
      if (!config.openaiApiKey && !config.anthropicApiKey && !config.openaiModel) {
        console.log(chalk.gray('Nenhuma configuração encontrada. Nada a remover.\n'));
        process.exit(0);
      }
      const confirm = await prompt(chalk.yellow(`⚠  Remove ${getConfigPath()}\n   Confirma? (s/N): `));
      if (confirm.toLowerCase() !== 's') {
        console.log(chalk.gray('\nOperação cancelada.\n'));
        process.exit(0);
      }
      clearConfig();
      console.log(chalk.green('\n✔ Configuração removida.\n'));
    });

  return cmd;
}
