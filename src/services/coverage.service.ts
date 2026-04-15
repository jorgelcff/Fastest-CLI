import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface RunTestsResult {
  success: boolean;
  output: string;
  coverageSummary: string;
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

    return { success, output, coverageSummary };
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

    return { success, output, coverageSummary };
  }

  /**
   * Reads the JSON coverage summary produced by Istanbul and formats it as a readable string.
   */
  readCoverageSummary(): string {
    const summaryPath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
    if (!fs.existsSync(summaryPath)) {
      return 'Coverage summary not available.';
    }

    try {
      const raw = fs.readFileSync(summaryPath, 'utf-8');
      const json = JSON.parse(raw) as Record<string, { pct?: number }[]>;
      const total = json['total'] as unknown as Record<string, { pct: number }>;

      if (!total) {
        return 'Coverage summary not available.';
      }

      const lines = [
        'Coverage Summary:',
        `  Statements : ${total['statements']?.pct ?? 0}%`,
        `  Branches   : ${total['branches']?.pct ?? 0}%`,
        `  Functions  : ${total['functions']?.pct ?? 0}%`,
        `  Lines      : ${total['lines']?.pct ?? 0}%`,
      ];

      return lines.join('\n');
    } catch {
      return 'Failed to parse coverage summary.';
    }
  }
}
