import path from 'path';

export interface TestValidationResult {
  valid: boolean;
  warnings: string[];
}

/**
 * Validates that generated test code references the target source module.
 */
export function validateGeneratedTests(
  testCode: string,
  sourceFilePath: string,
  testFilePath: string,
): TestValidationResult {
  const warnings: string[] = [];

  // 1. Check that the test file has at least one import/require statement
  const hasImport = /(?:import\s+.*from\s+|require\s*\()/.test(testCode);
  if (!hasImport) {
    warnings.push('Nenhum import/require encontrado no código gerado.');
  }

  // 2. Check that there's an import pointing to the source file
  const baseName = path.basename(sourceFilePath, path.extname(sourceFilePath));
  const importPattern = new RegExp(`(?:from\\s+['"]|require\\s*\\(\\s*['"]).*${escapeRegex(baseName)}`, 'i');
  if (!importPattern.test(testCode)) {
    warnings.push(`Nenhum import referenciando o módulo alvo "${baseName}" foi encontrado.`);
  }

  // 3. Check that there's at least one test case (it/test block)
  const hasTestCase = /^\s*(?:it|test)\s*\(/m.test(testCode);
  if (!hasTestCase) {
    warnings.push('Nenhum caso de teste (it/test) encontrado no código gerado.');
  }

  // 4. Check for describe blocks
  const hasDescribe = /^\s*describe\s*\(/m.test(testCode);
  if (!hasDescribe) {
    warnings.push('Nenhum bloco describe encontrado — testes podem estar mal organizados.');
  }

  // 5. Check that the test file has at least one assertion (expect)
  const hasExpect = /expect\s*\(/.test(testCode);
  if (!hasExpect) {
    warnings.push('Nenhuma asserção (expect) encontrada no código gerado.');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
