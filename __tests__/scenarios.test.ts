import { it, describe } from '@jest/globals'
import { AzCliTestRecorder, expectBaselineToMatch, isBaselineRecordEnabled } from './utils';
import { validateAndGetMarkdown, whatIfAndGetMarkdown } from '../src/run';

const subscriptionId = "d08e1a72-8180-4ed3-8125-9dff7376b0bd";
const resourceGroup = "ant-test";

describe('scenarios', () => {
  const timeout = 60000;
  const recordEnabled = isBaselineRecordEnabled();
  const scenarios = [
    'static-error',
    'basic-success',
  ];

  for (const scenario of scenarios) {
    const basePath = `${__dirname}/scenarios/${scenario}`;
    it('validates successfully', async () => {
      const azCli = new AzCliTestRecorder(
        `${basePath}/cli-validate.json`,
        recordEnabled ? 'record' : 'playback');

      const markdown = await validateAndGetMarkdown(azCli, {
        subscriptionId: subscriptionId,
        resourceGroup: resourceGroup,
        templateFile: `${basePath}/main.bicep`,
        parametersFile: `${basePath}/main.bicepparam`,
      });

      await expectBaselineToMatch(
        `${basePath}/validate.md`,
        markdown);

    }, timeout);
  }
});