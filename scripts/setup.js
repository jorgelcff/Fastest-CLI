#!/usr/bin/env node
/**
 * Fastest CLI — First-time setup script.
 * Run with: npm run setup
 *
 * What it does:
 *   1. Copies .env.example to .env (if .env is missing)
 *   2. Validates that OPENAI_API_KEY has been filled in
 *   3. Runs `npm run build`
 *   4. Runs `fastest doctor` on the current project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Helpers ───────────────────────────────────────────────────────────────────

const root = path.resolve(__dirname, '..');

function step(n, msg) {
  console.log(`\n\x1b[36m[${n}]\x1b[0m ${msg}`);
}

function ok(msg) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}

function warn(msg) {
  console.log(`  \x1b[33m⚠\x1b[0m  ${msg}`);
}

function fail(msg) {
  console.error(`  \x1b[31m✖\x1b[0m ${msg}`);
}

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

// ── Banner ────────────────────────────────────────────────────────────────────

console.log('\n\x1b[1m\x1b[36m⚡ Fastest CLI — Setup\x1b[0m\n');

// ── Step 1: .env ──────────────────────────────────────────────────────────────

step(1, 'Verificando arquivo .env …');

const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');

if (fs.existsSync(envPath)) {
  ok('.env já existe.');
} else if (fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  ok('.env criado a partir de .env.example.');
  warn('Abra o arquivo .env e substitua o valor de OPENAI_API_KEY pela sua chave real.');
  warn('Você pode obter uma chave em: https://platform.openai.com/api-keys');
} else {
  fail('.env.example não encontrado. Crie um arquivo .env manualmente com:');
  console.log('\n  OPENAI_API_KEY=sua_chave_aqui\n  OPENAI_MODEL=gpt-4o-mini\n');
}

// ── Step 2: Validate that key was filled in ───────────────────────────────────

step(2, 'Validando OPENAI_API_KEY …');

// Load .env manually (avoid dependency on dotenv here)
let keyFilled = false;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^OPENAI_API_KEY=(.+)$/m);
  const value = match ? match[1].trim() : '';
  keyFilled = Boolean(value) && value !== 'your_openai_api_key_here';
}

if (keyFilled) {
  ok('OPENAI_API_KEY parece estar configurada.');
} else {
  warn('OPENAI_API_KEY ainda não foi preenchida no arquivo .env.');
  warn('Edite o arquivo .env antes de executar o comando generate.');
  console.log('\n  Como obter sua chave:');
  console.log('  1. Acesse https://platform.openai.com/api-keys');
  console.log('  2. Clique em "Create new secret key"');
  console.log('  3. Copie o valor e cole em .env no campo OPENAI_API_KEY\n');
}

// ── Step 3: Build ─────────────────────────────────────────────────────────────

step(3, 'Compilando o projeto (npm run build) …');

try {
  run('npm run build');
  ok('Build concluído com sucesso.');
} catch {
  fail('Build falhou. Verifique os erros acima e tente novamente.');
  process.exit(1);
}

// ── Step 4: Doctor ────────────────────────────────────────────────────────────

step(4, 'Rodando fastest doctor …\n');

try {
  run('node dist/index.js doctor');
} catch {
  // doctor exits with code 2 when checks fail — that's expected if key is missing
}

// ── Done ──────────────────────────────────────────────────────────────────────

console.log('\n\x1b[1m\x1b[36m⚡ Setup concluído!\x1b[0m');

if (!keyFilled) {
  console.log('\nPróximo passo: preencha OPENAI_API_KEY no arquivo .env e rode:');
  console.log('\n  node dist/index.js generate \\');
  console.log('    --card="Como QA, quero validar as regras de negócio do OrderService" \\');
  console.log('    --file="example/order.service.ts"\n');
} else {
  console.log('\nPronto para usar! Experimente:\n');
  console.log('  node dist/index.js generate \\');
  console.log('    --card="Como QA, quero validar as regras de negócio do OrderService" \\');
  console.log('    --file="example/order.service.ts"\n');
}
