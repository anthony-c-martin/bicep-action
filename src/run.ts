import { ActionParameters, AzCliWrapper, validate, whatif } from "./azcli";
import {
  combine,
  getErrorTable,
  getResultHeading,
  getWhatIfTable
} from "./markdown";
import { ErrorResponse, WhatIfOperationResult } from "@azure/arm-resources";

export async function validateAndGetMarkdown(
  azCli: AzCliWrapper,
  parameters: ActionParameters
) {
  const heading = "Validate Results";
  const result = await validate(azCli, parameters);

  if (result.exitCode !== 0) {
    const errors = parseErrors(result.stderr);

    return combine([getResultHeading(heading, false), getErrorTable(errors)]);
  } else {
    return combine([getResultHeading(heading, true)]);
  }
}

export async function whatIfAndGetMarkdown(
  azCli: AzCliWrapper,
  parameters: ActionParameters
) {
  const heading = "What-If Results";
  const result = await whatif(azCli, parameters);

  if (result.exitCode !== 0) {
    const errors = parseErrors(result.stderr);

    return combine([getResultHeading(heading, false), getErrorTable(errors)]);
  } else {
    const response: WhatIfOperationResult = JSON.parse(result.stdout);

    return combine([
      getResultHeading(heading, true),
      getWhatIfTable(response.changes ?? [])
    ]);
  }
}

function parseErrors(stderr: string) {
  if (stderr.startsWith("ERROR: ")) {
    stderr = stderr.substring("ERROR: ".length);
  }

  const errors: ErrorResponse[] = [];
  const split = stderr.split(/\r?\n/);
  for (const line of split) {
    if (line.startsWith("{")) {
      errors.push(JSON.parse(line));
    } else if (
      /^(.+)\((\d+),(\d+)\)\s:\s(Error|Warning|Info)\s(.+):\s(.+)$/.test(line)
    ) {
      errors.push({ code: "BicepBuildError", message: line });
    }
  }

  return errors;
}
