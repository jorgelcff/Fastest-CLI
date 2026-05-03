import { Command } from 'commander';
import path from 'path';
import dotenv from 'dotenv';
import { LLMService } from '../services/llm.service';
import { TestGeneratorService } from '../services/test-generator.service';
import { CoverageService } from '../services/coverage.service';
import { getBaseName, readFile } from '../utils/file.utils';

dotenv.config();

export function buildGenerateCommand(): Command {
  const cmd = new Command('generate');

  cmd
    .description('Generate Jest unit tests from a card description and a source file')
    .requiredOption('--card <text>', 'Card description (feature or task being tested)')
    .requiredOption('--file <path>', 'Path to the source file to generate tests for')
    .option('--output <dir>', 'Output directory for the generated tests', 'tests')
    .option('--model <model>', 'OpenAI model to use (overrides OPENAI_MODEL env var)')
    .option('--dry-run', 'Simulate the full pipeline without calling LLM, writing files, or running Jest', false)
    .option('--suggest', 'After running tests, suggest additional test cases based on coverage', false)
    .action(async (opts: { card: string; file: string; output: string; model?: string; dryRun: boolean; suggest: boolean }) => {
      console.log('\n🚀 Fastest CLI — Test Generation Pipeline\n');

      // Dry-run mode validates inputs and shows exactly what would happen next.
      if (opts.dryRun) {
        console.log('🧪 DRY-RUN mode enabled (no external calls or file writes).\n');
        try {
          const source = readFile(opts.file);
          const sourceLines = source.split(/\r?\n/).length;
          const testFilePath = path.join(opts.output, `${getBaseName(opts.file)}.spec.ts`);
          const modelName = opts.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
          const prompt = LLMService.buildTestPrompt(opts.card, source);
          const promptPreview = prompt.split(/\r?\n/).slice(0, 12).join('\n');

          console.log(`📄 Source file validated: ${opts.file}`);
          console.log(`   📏 Source size: ${sourceLines} line(s)`);
          console.log(`   🧩 Card length: ${opts.card.length} character(s)`);
          console.log(`   🤖 Model selected: ${modelName}`);
          console.log(`   📁 Planned output file: ${testFilePath}\n`);

          console.log('--- Planned Steps ---');
          console.log('1) Build LLM prompt from card + source code');
          console.log('2) Call LLM to generate Jest tests');
          console.log('3) Save generated tests to output directory');
          console.log('4) Run Jest with coverage and read summary');
          if (opts.suggest) {
            console.log('5) Generate additional test suggestions from coverage gaps');
          }
          console.log('--- End Planned Steps ---\n');

          console.log(`📝 Prompt size: ${prompt.length} character(s)`);
          console.log('--- Prompt Preview (first 12 lines) ---');
          console.log(promptPreview);
          if (prompt.split(/\r?\n/).length > 12) {
            console.log('...');
          }
          console.log('--- End Prompt Preview ---\n');

          console.log('🏁 Dry-run complete. No files were created and no tests were executed.\n');
          process.exit(0);
        } catch (err: unknown) {
          console.error(`❌ Dry-run validation failed: ${(err as Error).message}`);
          process.exit(1);
        }
      }

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
