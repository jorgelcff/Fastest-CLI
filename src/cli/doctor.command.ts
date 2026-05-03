import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

export function buildDoctorCommand(): Command {
  const cmd = new Command('doctor');

  cmd
    .description('Validate target project environment and prerequisites for Fastest CLI')
    .option('--cwd <dir>', 'Directory of the target project', process.cwd())
    .action((opts: { cwd: string }) => {
      const root = path.resolve(opts.cwd);
      console.log('\n🔎 Fastest CLI — Environment Doctor\n');

      const checks: Array<{ name: string; ok: boolean; hint?: string }> = [];

      // 1. package.json exists
      const pkgPath = path.join(root, 'package.json');
      const pkgExists = fs.existsSync(pkgPath);
      checks.push({
        name: 'package.json present',
        ok: pkgExists,
        hint: pkgExists ? undefined : 'Run `npm init` or ensure package.json exists',
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
        name: 'Jest configured (script or config file)',
        ok: jestConfig || hasJest,
        hint: jestConfig || hasJest ? undefined : 'Add Jest (npm i -D jest) or a test script in package.json',
      });

      // 3. tsconfig.json exists (TypeScript project)
      const tsconfig = fs.existsSync(path.join(root, 'tsconfig.json'));
      checks.push({
        name: 'tsconfig.json present',
        ok: tsconfig,
        hint: tsconfig ? undefined : 'If using TypeScript, add tsconfig.json (npx tsc --init)',
      });

      // 4. Node version (simple check via process.version)
      const nodeVer = process.version.replace(/^v/, '');
      const major = parseInt(nodeVer.split('.')[0], 10) || 0;
      const nodeOk = major >= 18;
      checks.push({
        name: `Node >=18 (detected ${process.version})`,
        ok: nodeOk,
        hint: nodeOk ? undefined : 'Upgrade Node.js to v18 or newer',
      });

      // 5. OPENAI_API_KEY set in environment (if present use)
      const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
      checks.push({
        name: 'OPENAI_API_KEY present in environment',
        ok: hasApiKey,
        hint: hasApiKey ? undefined : 'Set OPENAI_API_KEY in environment or .env before running real generation',
      });

      // Report
      let allOk = true;
      checks.forEach((c) => {
        console.log(`${c.ok ? '✅' : '❌'} ${c.name}`);
        if (!c.ok) {
          allOk = false;
          if (c.hint) console.log(`   → ${c.hint}`);
        }
      });

      console.log('\nSummary:');
      if (allOk) {
        console.log('🎉 Environment looks good for running Fastest CLI.');
        process.exit(0);
      } else {
        console.log('⚠️  Some checks failed. Follow the hints above to fix the environment.');
        process.exit(2);
      }
    });

  return cmd;
}
