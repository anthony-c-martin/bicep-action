import { getBooleanInput, getInput } from '@actions/core'

export type Inputs = {
  subscriptionId: string,
  resourceGroup: string,
  templateFile: string,
  parametersFile: string,
  runWhatIf: boolean,
};

export async function getInputs(): Promise<Inputs> {
  const subscriptionId = getInput("subscriptionId", { required: true });
  const resourceGroup = getInput("resourceGroup", { required: true });
  const templateFile = getInput("templateFile", { required: true });
  const parametersFile = getInput("parametersFile", { required: true });
  const runWhatIf = getBooleanInput('whatIf', { required: false });

  return {
    subscriptionId,
    resourceGroup,
    templateFile,
    parametersFile,
    runWhatIf,
  };
}