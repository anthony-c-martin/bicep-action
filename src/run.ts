import path from 'path';
import { getInput } from '@actions/core'
import { ActionParameters, AzCli, AzCliWrapper, validate, whatif } from './azcli';
import { combine, getErrorTable, getResultHeading, getWhatIfTable } from './markdown';
import { ErrorResponse, WhatIfChange, WhatIfOperationResult } from '@azure/arm-resources';

export async function validateAndGetMarkdown(azCli: AzCliWrapper, parameters: ActionParameters) {
  const heading = 'Validate Results';
  const result = await validate(azCli, parameters);

  if (result.exitCode !== 0) {
    const errorJson = result.stderr.substring(result.stderr.indexOf('{'));
    const error: ErrorResponse = JSON.parse(errorJson)

    return combine([
      getResultHeading(heading, false),
      getErrorTable(error),
    ]);
  } else {
    return combine([
      getResultHeading(heading, true),
    ]);
  }
}

export async function whatIfAndGetMarkdown(azCli: AzCliWrapper, parameters: ActionParameters) {
  const heading = 'What-If Results';
  const result = await whatif(azCli, parameters);

  if (result.exitCode !== 0) {
    const errorJson = result.stderr.substring(result.stderr.indexOf('{'));
    const error: ErrorResponse = JSON.parse(errorJson)

    return combine([
      getResultHeading(heading, false),
      getErrorTable(error),
    ]);
  } else {
    const response: WhatIfOperationResult = JSON.parse(result.stdout);

    return combine([
      getResultHeading(heading, true),
      getWhatIfTable(response.changes ?? []),
    ]);
  }
}