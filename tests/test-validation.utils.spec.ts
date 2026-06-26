import { validateGeneratedTests } from '../src/utils/test-validation.utils';

describe('validateGeneratedTests', () => {
  const SOURCE = 'src/math.utils.ts';
  const TEST = 'tests/math.utils.spec.ts';

  it('returns valid for well-formed test code', () => {
    const code = `
import { add } from '../src/math.utils';
describe('add', () => {
  it('adds two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when no import is found', () => {
    const code = `
describe('test', () => {
  it('works', () => {
    expect(1).toBe(1);
  });
});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('import/require')]),
    );
  });

  it('warns when import does not reference the source module', () => {
    const code = `import { foo } from '../src/other';
describe('test', () => {
  it('works', () => {
    expect(1).toBe(1);
  });
});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('math.utils')]),
    );
  });

  it('warns when no test cases found', () => {
    const code = `import { add } from '../src/math.utils';
describe('add', () => {});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('it/test')]),
    );
  });

  it('warns when no describe block found', () => {
    const code = `import { add } from '../src/math.utils';
it('works', () => {
  expect(add(1,2)).toBe(3);
});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('describe')]),
    );
  });

  it('warns when no expect assertion found', () => {
    const code = `import { add } from '../src/math.utils';
describe('add', () => {
  it('works', () => {
    add(1,2);
  });
});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('expect')]),
    );
  });

  it('accepts require() syntax', () => {
    const code = `const { add } = require('../src/math.utils');
describe('add', () => {
  it('works', () => {
    expect(add(1,2)).toBe(3);
  });
});`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.valid).toBe(true);
  });

  it('returns multiple warnings when multiple issues exist', () => {
    const code = `const x = 1;`;
    const result = validateGeneratedTests(code, SOURCE, TEST);
    expect(result.warnings.length).toBeGreaterThan(1);
  });
});
