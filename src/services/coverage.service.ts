import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface RunTestsResult {
  success: boolean;
  output: string;
  coverageSummary: string;
  coverageData?: CoverageData;
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
    const summaryPath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
    if (!fs.existsSync(summaryPath)) return undefined;

    try {
      const raw = fs.readFileSync(summaryPath, 'utf-8');
      const json = JSON.parse(raw) as Record<string, { pct?: number }[]>;
      const total = json['total'] as unknown as Record<string, { pct: number }>;
      if (!total) return undefined;

      return {
        statements: total['statements']?.pct ?? 0,
        branches: total['branches']?.pct ?? 0,
        functions: total['functions']?.pct ?? 0,
        lines: total['lines']?.pct ?? 0,
      };
    } catch {
      return undefined;
    }
  }
}
