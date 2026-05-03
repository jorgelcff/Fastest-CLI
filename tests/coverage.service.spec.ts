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
});
