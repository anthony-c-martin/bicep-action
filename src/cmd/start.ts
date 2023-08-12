import { exec } from 'child_process';
import util from 'util';
import { writeFile } from 'fs/promises';
import { Deployment, ResourceManagementClient, } from '@azure/arm-resources';
import { DefaultAzureCredential } from "@azure/identity";
import { executeSynchronous, isBaselineRecordEnabled } from "../utils";
import { combine, getErrorTable, getResultHeading } from '../markdown';
import path from 'path';
import { validate, whatif } from '../azure';

const execAsync = util.promisify(exec);
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
  const result = await validate(client, resourceGroup, deployment);
  switch (result.result) {
    case 'success':
      return combine([
        getResultHeading('Validate Results', true),
      ]);
    case 'error':
      return combine([
        getResultHeading('Validate Results', false),
        getErrorTable(result.error),
      ]);
  }
}

async function generateWhatIfMarkdown(client: ResourceManagementClient, deployment: Deployment) {
  const result = await whatif(client, resourceGroup, deployment);
  switch (result.result) {
    case 'success':
      return combine([
        getResultHeading('What-If Results', true),
      ]);
    case 'error':
      return combine([
        getResultHeading('What-If Results', false),
        getErrorTable(result.error),
      ]);
  }
}

async function bicepBuild(path: string) {
  const { stdout, stderr } = await execAsync(`bicep build --stdout ${path}`);

  if (stderr) {
    console.error(stderr);
  }
  return stdout;
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