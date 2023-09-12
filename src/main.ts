import { getBooleanInput, getInput, summary } from "@actions/core";
import { AzCli } from "./azcli";
import { validateAndGetMarkdown, whatIfAndGetMarkdown } from "./run";
import { addOrUpdateComment } from "./github";

async function run(): Promise<void> {
  let runWhatIf
  try {
    runWhatIf = getBooleanInput('whatIf')
  }
  catch (err) {
    runWhatIf = false
  }

  if (runWhatIf) {
    await whatIfAndGetMarkdown(new AzCli(), {
      subscriptionId: getInput("subscriptionId", { required: true }),
      resourceGroup: getInput("resourceGroup", { required: true }),
      templateFile: getInput("templateFile", { required: true }),
      parametersFile: getInput("parametersFile", { required: true })
    }, writeSummary);
  } else {
    const markdown = await validateAndGetMarkdown(new AzCli(), {
      subscriptionId: getInput("subscriptionId", { required: true }),
      resourceGroup: getInput("resourceGroup", { required: true }),
      templateFile: getInput("templateFile", { required: true }),
      parametersFile: getInput("parametersFile", { required: true })
    });

    await addOrUpdateComment(markdown);
  }
}

async function writeSummary(heading: string, body: string[][]) {
  await summary
    .addHeading(heading)
    .addTable(body)
    .write();
}

run();
