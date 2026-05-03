#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { buildGenerateCommand } from './cli/generate.command';
import { buildDoctorCommand } from './cli/doctor.command';
import { buildConfigCommand } from './cli/config.command';
import { version } from '../package.json';

const program = new Command();

program
  .name('fastest')
  .description('Fastest CLI — Pipeline Inteligente de Geração de Testes a partir de Cards')
  .version(version, '-v, --version', 'Exibe a versão atual');

program.addCommand(buildGenerateCommand());
program.addCommand(buildDoctorCommand());
program.addCommand(buildConfigCommand());

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(chalk.red(`\n✖ Erro inesperado: ${(err as Error).message}\n`));
  process.exit(1);
});
