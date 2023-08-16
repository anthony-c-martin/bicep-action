import path from 'path';
import { getInput } from '@actions/core'
import { AzCli } from './azcli';
import { validateAndGetMarkdown } from './run';
import { addOrUpdateComment } from './github';

async function run(): Promise<void> {
  const markdown = await validateAndGetMarkdown(new AzCli(), {
    subscriptionId: getInput('subscriptionId', { required: true }),
    resourceGroup: getInput('resourceGroup', { required: true }),
    templateFile: getInput('templateFile', { required: true }),
    parametersFile: getInput('parametersFile', { required: true }),
  });

  await addOrUpdateComment(markdown);
}

run();