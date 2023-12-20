import { setFailed, summary } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { getInputs } from "./inputs";
import { readFile } from "fs/promises";
import { Bicep } from "bicep-node";
import os from "os";
import { RestError } from "@azure/core-rest-pipeline";
import {
  CloudError,
  ErrorResponse,
  ResourceManagementClient
} from "@azure/arm-resources";
import { AzureCliCredential } from "@azure/identity";
import {
  combine,
  convertTableToString,
  getErrorTable,
  getResultHeading
} from "./markdown";
import path from "path";

type Configuration = {
  subscriptionId: string;
  resourceGroup: string;
  name?: string;
  bicepVersion: string;
  bicepParamsFile: string;
  paramOverrides?: Record<string, unknown>;
};

type BuildBicepParamsStdout = {
  templateJson?: string;
  templateSpecId?: string;
  parametersJson: string;
};

type UntypedError = unknown;

async function run(): Promise<void> {
  const inputs = await getInputs();
  const configPath = path.resolve(inputs.config);
  const config: Configuration = JSON.parse(await readFile(configPath, "utf8"));

  const bicepParamsPath = path.join(
    path.dirname(configPath),
    config.bicepParamsFile
  );

  if (inputs.action !== "validate") {
    throw `Unsupported action: ${inputs.action}`;
  }

  const bicepPath = await Bicep.install(os.tmpdir(), config.bicepVersion);
  const result = await getExecOutput(
    bicepPath,
    ["build-params", "--stdout", bicepParamsPath],
    {
      silent: true,
      env: {
        BICEP_PARAMETERS_OVERRIDES: JSON.stringify(config.paramOverrides || {})
      }
    }
  );

  if (result.exitCode !== 0) {
    throw result.stderr;
  }

  const buildParamsOutput: BuildBicepParamsStdout = JSON.parse(result.stdout);

  if (!buildParamsOutput.templateJson) {
    throw "Template JSON not found in build-params output";
  }

  const client = new ResourceManagementClient(
    new AzureCliCredential(),
    config.subscriptionId
  );

  const template = JSON.parse(buildParamsOutput.templateJson);
  const { parameters } = JSON.parse(buildParamsOutput.parametersJson);

  const scope = `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}`;

  let error: ErrorResponse | undefined;
  try {
    const poller = await client.deployments.beginValidateAtScope(
      scope,
      config.name || "bicep-action",
      {
        properties: {
          template,
          parameters,
          mode: "Incremental"
        }
      }
    );

    const validateResult = await poller.pollUntilDone();
    error = validateResult.error;
  } catch (e) {
    error = parseError(e);
  }

  if (error?.details) {
    const markdown = combine([
      getResultHeading("Validate Results", false),
      convertTableToString(getErrorTable(error.details))
    ]);
    summary.addRaw(markdown).write();
    setFailed("Validation failed");
  } else {
    const markdown = getResultHeading("Validate Results", true);
    summary.addRaw(markdown).write();
  }
}

function parseError(error: UntypedError) {
  if (error instanceof RestError) {
    return (error.details as CloudError).error;
  }

  return {
    message: `${error}`
  };
}

run();
