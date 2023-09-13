import { summary } from "@actions/core";
import { AzCli } from "./azcli";
import { validateAndGetMarkdown, whatIfAndGetMarkdown } from "./run";
import { getInputs } from "./inputs";

async function run(): Promise<void> {
  const inputs = await getInputs();

  const markdown = inputs.runWhatIf ?
    await whatIfAndGetMarkdown(new AzCli(), inputs) :
    await validateAndGetMarkdown(new AzCli(), inputs);

  summary.addRaw(markdown).write();
}

run();