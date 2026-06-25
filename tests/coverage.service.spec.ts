import path from 'path';

// Mock child_process and fs before importing the service
jest.mock('child_process', () => ({ execSync: jest.fn() }));
jest.mock('fs');

import { execSync } from 'child_process';
import fs from 'fs';
import { CoverageService } from '../src/services/coverage.service';

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

const SUMMARY = {
  total: {
    statements: { pct: 90 },
    branches: { pct: 75 },
    functions: { pct: 100 },
    lines: { pct: 88 },
  },
};

describe('CoverageService', () => {
  const root = '/project';
  const summaryPath = path.join(root, 'coverage', 'coverage-summary.json');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── readCoverageData ────────────────────────────────────────────────────────

  describe('readCoverageData', () => {
    it('returns undefined when summary file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      expect(svc.readCoverageData()).toBeUndefined();
    });

    it('parses coverage percentages from JSON', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(SUMMARY) as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      const data = svc.readCoverageData();
      expect(data).toEqual({ statements: 90, branches: 75, functions: 100, lines: 88 });
    });

    it('returns undefined when JSON is malformed', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('not-json' as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      expect(svc.readCoverageData()).toBeUndefined();
    });
  });

  // ── readCoverageSummary ─────────────────────────────────────────────────────

  describe('readCoverageSummary', () => {
    it('returns fallback string when data unavailable', () => {
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      expect(svc.readCoverageSummary()).toBe('Coverage summary not available.');
    });

    it('includes all four metrics in output', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(SUMMARY) as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      const summary = svc.readCoverageSummary();
      expect(summary).toContain('90%');
      expect(summary).toContain('75%');
      expect(summary).toContain('100%');
      expect(summary).toContain('88%');
    });
  });

  // ── runWithCoverage ─────────────────────────────────────────────────────────

  describe('runWithCoverage', () => {
    it('returns success=true when execSync does not throw', () => {
      mockExecSync.mockReturnValue('Tests passed' as unknown as ReturnType<typeof fs.readFileSync>);
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      const result = svc.runWithCoverage();
      expect(result.success).toBe(true);
      expect(result.output).toBe('Tests passed');
    });

    it('returns success=false when execSync throws', () => {
      mockExecSync.mockImplementation(() => {
        const err = new Error('Tests failed') as Error & { stdout: string; stderr: string };
        err.stdout = 'FAIL src/foo.spec.ts';
        err.stderr = '';
        throw err;
      });
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      const result = svc.runWithCoverage();
      expect(result.success).toBe(false);
      expect(result.output).toContain('FAIL');
    });

    it('includes coverageData when summary exists', () => {
      mockExecSync.mockReturnValue('' as unknown as ReturnType<typeof fs.readFileSync>);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(SUMMARY) as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      const result = svc.runWithCoverage();
      expect(result.coverageData).toBeDefined();
      expect(result.coverageData?.statements).toBe(90);
    });
  });

  // ── runTests ────────────────────────────────────────────────────────────────

  describe('runTests', () => {
    it('passes the test file path to Jest', () => {
      mockExecSync.mockReturnValue('' as unknown as ReturnType<typeof fs.readFileSync>);
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      svc.runTests('tests/foo.spec.ts');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('tests/foo.spec.ts'),
        expect.any(Object),
      );
    });
  });

  // ── runTests error handling ─────────────────────────────────────────────────

  describe('runTests (error handling)', () => {
    it('returns success=false with combined output when execSync throws', () => {
      mockExecSync.mockImplementation(() => {
        const err = new Error('jest failed') as Error & { stdout: string; stderr: string };
        err.stdout = 'FAIL tests/foo.spec.ts';
        err.stderr = 'Some error output';
        throw err;
      });
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      const result = svc.runTests('tests/foo.spec.ts');
      expect(result.success).toBe(false);
      expect(result.output).toContain('FAIL tests/foo.spec.ts');
      expect(result.output).toContain('Some error output');
    });
  });

  // ── readCoverageForFile ────────────────────────────────────────────────────

  describe('readCoverageForFile', () => {
    const FILE_SUMMARY = {
      '/project/src/foo.ts': {
        statements: { pct: 80 },
        branches: { pct: 70 },
        functions: { pct: 90 },
        lines: { pct: 85 },
      },
    };

    it('returns coverage when file key matches absolute path', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(FILE_SUMMARY) as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      const data = svc.readCoverageForFile('/project/src/foo.ts');
      expect(data).toEqual({ statements: 80, branches: 70, functions: 90, lines: 85 });
    });

    it('returns undefined when file has no coverage entry', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(FILE_SUMMARY) as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      const data = svc.readCoverageForFile('/project/src/bar.ts');
      expect(data).toBeUndefined();
    });

    it('returns undefined when summary file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      const svc = new CoverageService(root);
      const data = svc.readCoverageForFile('/project/src/foo.ts');
      expect(data).toBeUndefined();
    });
  });

  // ── validateGeneratedFile ──────────────────────────────────────────────────

  describe('validateGeneratedFile', () => {
    it('returns valid=true for .js files without running tsc', () => {
      const svc = new CoverageService(root);
      const result = svc.validateGeneratedFile('tests/foo.spec.js');
      expect(result).toEqual({ valid: true, errors: '' });
      expect(mockExecSync).not.toHaveBeenCalled();
    });

    it('returns valid=true when tsc succeeds', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue('' as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      const result = svc.validateGeneratedFile('tests/foo.spec.ts');
      expect(result).toEqual({ valid: true, errors: '' });
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.any(Object),
      );
    });

    it('uses tsconfig.test.json when it exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('' as unknown as ReturnType<typeof fs.readFileSync>);
      const svc = new CoverageService(root);
      svc.validateGeneratedFile('tests/foo.spec.ts');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.test.json'),
        expect.any(Object),
      );
    });

    it('returns valid=false with filtered errors when tsc fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        const err = new Error('tsc failed') as Error & { stdout: string; stderr: string };
        err.stdout = [
          'tests/foo.spec.ts(3,5): error TS2304: Cannot find name "x".',
          'some other line',
          'error TS6053: File not found.',
        ].join('\n');
        err.stderr = '';
        throw err;
      });
      const svc = new CoverageService(root);
      const result = svc.validateGeneratedFile('tests/foo.spec.ts');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('error TS2304');
      expect(result.errors).toContain('error TS6053');
      expect(result.errors).not.toContain('some other line');
    });
  });

  describe('analyzeCriticalFlowGaps', () => {
    it('returns no gaps for high coverage', () => {
      const svc = new CoverageService(root);
      const gaps = svc.analyzeCriticalFlowGaps({
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      });
      expect(gaps).toHaveLength(0);
    });

    it('returns gaps for low critical metrics', () => {
      const svc = new CoverageService(root);
      const gaps = svc.analyzeCriticalFlowGaps({
        statements: 60,
        branches: 50,
        functions: 70,
        lines: 65,
      });
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.some((g) => g.metric === 'branches')).toBe(true);
    });
  });
});
