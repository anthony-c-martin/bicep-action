import { writeFile } from 'fs/promises';
import { Deployment, ResourceManagementClient, } from '@azure/arm-resources';
import { DefaultAzureCredential } from "@azure/identity";
import { executeSynchronous, isBaselineRecordEnabled } from "../utils";
import { combine, getErrorTable, getResultHeading, getWhatIfTable } from '../markdown';
import path from 'path';
import { validate, whatif } from '../azure';
import { bicepBuild } from '../bicep';

const root = path.resolve(__dirname, '../..');

const subscriptionId = "d08e1a72-8180-4ed3-8125-9dff7376b0bd";
const resourceGroup = "ant-test";

executeSynchronous(main);

async function main() {
  const client = new ResourceManagementClient(new DefaultAzureCredential(), subscriptionId);

  await scenario(client, `${root}/responses/static-error`);
}

async function scenario(client: ResourceManagementClient, scenarioPath: string) {
  const template = await bicepBuild(`${scenarioPath}/main.bicep`);
  const deployment = getDeployment(template);

  const validateResult = await generateValidateMarkdown(client, deployment);
  if (isBaselineRecordEnabled()) {
    await writeFile(`${scenarioPath}/validate.md`, validateResult);
  }

  const whatIfResult = await generateWhatIfMarkdown(client, deployment);
  if (isBaselineRecordEnabled()) {
    await writeFile(`${scenarioPath}/whatif.md`, whatIfResult);
  }
}

async function generateValidateMarkdown(client: ResourceManagementClient, deployment: Deployment) {
  const heading = 'Validate Results';
  const result = await validate(client, resourceGroup, deployment);
  switch (result.result) {
    case 'success':
      return combine([
        getResultHeading(heading, true),
      ]);
    case 'error':
      return combine([
        getResultHeading(heading, false),
        getErrorTable(result.error),
      ]);
  }
}

async function generateWhatIfMarkdown(client: ResourceManagementClient, deployment: Deployment) {
  const heading = 'What-If Results';
  const result = await whatif(client, resourceGroup, deployment);
  switch (result.result) {
    case 'success':
      return combine([
        getResultHeading(heading, true),
        getWhatIfTable(result.value),
      ]);
    case 'error':
      return combine([
        getResultHeading(heading, false),
        getErrorTable(result.error),
      ]);
  }
}

function getDeployment(template: string): Deployment {
  return {
    properties: {
      mode: 'Incremental',
      parameters: {},
      template: JSON.parse(template),
    }
  }
}