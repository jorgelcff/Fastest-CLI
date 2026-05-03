#!/usr/bin/env node

import { Command } from 'commander';
import { buildGenerateCommand } from './cli/generate.command';
import { buildDoctorCommand } from './cli/doctor.command';

const program = new Command();

program
  .name('fastest')
  .description('Fastest CLI — Intelligent test generation pipeline from cards')
  .version('1.0.0');

program.addCommand(buildGenerateCommand());
program.addCommand(buildDoctorCommand());

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error('Unexpected error:', (err as Error).message);
  process.exit(1);
});
