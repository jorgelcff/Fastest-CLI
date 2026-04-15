import { Command } from 'commander';
import dotenv from 'dotenv';
import { LLMService } from '../services/llm.service';
import { TestGeneratorService } from '../services/test-generator.service';
import { CoverageService } from '../services/coverage.service';

dotenv.config();

export function buildGenerateCommand(): Command {
  const cmd = new Command('generate');

  cmd
    .description('Generate Jest unit tests from a card description and a source file')
    .requiredOption('--card <text>', 'Card description (feature or task being tested)')
    .requiredOption('--file <path>', 'Path to the source file to generate tests for')
    .option('--output <dir>', 'Output directory for the generated tests', 'tests')
    .option('--model <model>', 'OpenAI model to use (overrides OPENAI_MODEL env var)')
    .option('--suggest', 'After running tests, suggest additional test cases based on coverage', false)
    .action(async (opts: { card: string; file: string; output: string; model?: string; suggest: boolean }) => {
      console.log('\n🚀 Fastest CLI — Test Generation Pipeline\n');

      // 1. Initialise services
      let llm: LLMService;
      try {
        llm = new LLMService({ model: opts.model });
      } catch (err: unknown) {
        console.error(`❌ ${(err as Error).message}`);
        process.exit(1);
      }

      const generator = new TestGeneratorService(llm);
      const coverage = new CoverageService(process.cwd());

      // 2. Generate tests
      console.log(`📄 Reading source file: ${opts.file}`);
      console.log(`🧠 Sending to LLM for test generation…`);

      let result;
      try {
        result = await generator.generate({
          card: opts.card,
          filePath: opts.file,
          outputDir: opts.output,
        });
      } catch (err: unknown) {
        console.error(`❌ Test generation failed: ${(err as Error).message}`);
        process.exit(1);
      }

      console.log(`\n✅ Tests generated successfully!`);
      console.log(`   📁 File  : ${result.testFilePath}`);
      console.log(`   🧪 Tests : ${result.testCount} test case(s) found\n`);

      // 3. Run tests with coverage
      console.log('▶  Running tests with coverage…\n');
      const runResult = coverage.runWithCoverage();

      const statusIcon = runResult.success ? '✅' : '❌';
      console.log(`${statusIcon} Test execution ${runResult.success ? 'passed' : 'failed'}\n`);
      console.log('--- Jest Output ---');
      console.log(runResult.output);
      console.log('--- End Jest Output ---\n');
      console.log(runResult.coverageSummary);

      // 4. Optionally suggest additional tests
      if (opts.suggest) {
        console.log('\n💡 Analysing coverage gaps and suggesting new test cases…\n');
        try {
          const { readFile } = await import('../utils/file.utils');
          const code = readFile(opts.file);
          const suggestionPrompt = llm.buildCoverageSuggestionPrompt(
            opts.card,
            code,
            runResult.coverageSummary,
          );
          const suggestions = await llm.complete(suggestionPrompt);
          console.log('--- Suggested Additional Tests ---');
          console.log(suggestions);
          console.log('--- End Suggestions ---\n');
        } catch (err: unknown) {
          console.error(`⚠  Could not generate suggestions: ${(err as Error).message}`);
        }
      }

      console.log('\n🏁 Pipeline complete.\n');
      process.exit(runResult.success ? 0 : 1);
    });

  return cmd;
}
