import { which } from "@actions/io";
import { ExecOutput, getExecOutput } from "@actions/exec";

export type ActionParameters = {
  managementGroup?: string;
  subscriptionId?: string;
  resourceGroup?: string;
  deploymentName?: string;
  templateFile: string;
  parametersFile?: string;
};

export interface AzCliWrapper {
  execute(parameters: string[]): Promise<ExecOutput>;
}

export class AzCli implements AzCliWrapper {
  async execute(parameters: string[]): Promise<ExecOutput> {
    const azPath = await which("az");

    return await getExecOutput(azPath, parameters, {
      silent: true,
      failOnStdErr: false,
      ignoreReturnCode: true
    });
  }
}

export async function validate(
  wrapper: AzCliWrapper,
  params: ActionParameters
) {
  const parameters = [
    "deployment",
    "group",
    "validate",
    ...(params.managementGroup
      ? ["--management-group", params.managementGroup]
      : []),
    ...(params.subscriptionId ? ["--subscription", params.subscriptionId] : []),
    ...(params.resourceGroup ? ["--resource-group", params.resourceGroup] : []),
    ...(params.deploymentName ? ["--name", params.deploymentName] : []),
    ...["--template-file", params.templateFile],
    ...(params.parametersFile ? ["--parameters", params.parametersFile] : []),
    ...["--output", "json"],
    ...["--only-show-errors"]
  ];

  return await wrapper.execute(parameters);
}

export async function whatif(wrapper: AzCliWrapper, params: ActionParameters) {
  const parameters = [
    "deployment",
    "group",
    "what-if",
    ...(params.managementGroup
      ? ["--management-group", params.managementGroup]
      : []),
    ...(params.subscriptionId ? ["--subscription", params.subscriptionId] : []),
    ...(params.resourceGroup ? ["--resource-group", params.resourceGroup] : []),
    ...(params.deploymentName ? ["--name", params.deploymentName] : []),
    ...["--template-file", params.templateFile],
    ...(params.parametersFile ? ["--parameters", params.parametersFile] : []),
    ...["--output", "json"],
    ...["--only-show-errors"],
    ...["--no-pretty-print"]
  ];

  return await wrapper.execute(parameters);
}
