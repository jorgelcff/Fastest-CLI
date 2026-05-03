import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface RunTestsResult {
  success: boolean;
  output: string;
  coverageSummary: string;
  coverageData?: CoverageData;
}

export interface ValidationResult {
  valid: boolean;
  errors: string;
}

export interface CoverageData {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export class CoverageService {
  private readonly projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = path.resolve(projectRoot);
  }

  /**
   * Runs Jest programmatically via CLI and returns combined output + coverage summary.
   */
  runTests(testFilePath: string): RunTestsResult {
    const opts: ExecSyncOptionsWithStringEncoding = {
      cwd: this.projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    };

    let output = '';
    let success = false;

    try {
      output = execSync(
        `npx jest "${testFilePath}" --no-coverage --passWithNoTests 2>&1`,
        opts,
      );
      success = true;
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; message?: string };
      output = [execErr.stdout, execErr.stderr, execErr.message]
        .filter(Boolean)
        .join('\n');
      success = false;
    }

    const coverageSummary = this.readCoverageSummary();
    const coverageData = this.readCoverageData();

    return { success, output, coverageSummary, coverageData };
  }

  /**
   * Runs all tests with coverage collection enabled.
   */
  runWithCoverage(): RunTestsResult {
    const opts: ExecSyncOptionsWithStringEncoding = {
      cwd: this.projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    };

    let output = '';
    let success = false;

    try {
      output = execSync(
        'npx jest --coverage --passWithNoTests 2>&1',
        opts,
      );
      success = true;
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; message?: string };
      output = [execErr.stdout, execErr.stderr, execErr.message]
        .filter(Boolean)
        .join('\n');
      success = false;
    }

    const coverageSummary = this.readCoverageSummary();
    const coverageData = this.readCoverageData();

    return { success, output, coverageSummary, coverageData };
  }

  /**
   * Reads the JSON coverage summary produced by Istanbul and formats it as a readable string.
   */
  readCoverageSummary(): string {
    const data = this.readCoverageData();
    if (!data) return 'Coverage summary not available.';
    return [
      'Coverage Summary:',
      `  Statements : ${data.statements}%`,
      `  Branches   : ${data.branches}%`,
      `  Functions  : ${data.functions}%`,
      `  Lines      : ${data.lines}%`,
    ].join('\n');
  }

  readCoverageData(): CoverageData | undefined {
    return this.readCoverageFromSummary('total');
  }

  /**
   * Reads coverage for a specific source file from the Istanbul summary.
   * Returns undefined if the file has no coverage entry (e.g. no tests ran yet).
   * In that case the caller should treat it as 0% baseline.
   */
  readCoverageForFile(sourceFilePath: string): CoverageData | undefined {
    const abs = path.resolve(sourceFilePath);
    // coverage-summary.json keys can use forward or backslashes depending on OS
    return (
      this.readCoverageFromSummary(abs) ??
      this.readCoverageFromSummary(abs.replace(/\\/g, '/')) ??
      this.readCoverageFromSummary(abs.replace(/\//g, '\\'))
    );
  }

  /**
   * Runs tsc --noEmit to validate the generated test file compiles without errors.
   * Only applies to TypeScript files; JavaScript files are skipped (always valid).
   */
  validateGeneratedFile(testFilePath: string): ValidationResult {
    const ext = path.extname(testFilePath).toLowerCase();
    if (ext !== '.ts' && ext !== '.tsx') {
      return { valid: true, errors: '' };
    }

    const opts: ExecSyncOptionsWithStringEncoding = {
      cwd: this.projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    };

    try {
      const tsconfigTest = path.join(this.projectRoot, 'tsconfig.test.json');
      const tsconfig = fs.existsSync(tsconfigTest) ? 'tsconfig.test.json' : 'tsconfig.json';
      execSync(`npx tsc --project ${tsconfig} --noEmit 2>&1`, opts);
      return { valid: true, errors: '' };
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string; message?: string };
      const raw = [e.stdout, e.stderr].filter(Boolean).join('\n');
      // Show only the lines related to our generated file to avoid noise
      const relevant = raw
        .split('\n')
        .filter(l => l.includes(testFilePath) || l.match(/error TS/))
        .slice(0, 8)
        .join('\n');
      return { valid: false, errors: relevant || raw.slice(0, 400) };
    }
  }

  private readCoverageFromSummary(key: string): CoverageData | undefined {
    const summaryPath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
    if (!fs.existsSync(summaryPath)) return undefined;

    try {
      const raw = fs.readFileSync(summaryPath, 'utf-8');
      const json = JSON.parse(raw) as Record<string, Record<string, { pct: number }>>;
      const entry = json[key];
      if (!entry) return undefined;

      return {
        statements: entry['statements']?.pct ?? 0,
        branches:   entry['branches']?.pct   ?? 0,
        functions:  entry['functions']?.pct  ?? 0,
        lines:      entry['lines']?.pct      ?? 0,
      };
    } catch {
      return undefined;
    }
  }
}
