import { CloudError, Deployment, DeploymentPropertiesExtended, DeploymentWhatIf, ErrorResponse, ResourceManagementClient, WhatIfChange, } from '@azure/arm-resources';
import { RestError } from "@azure/core-rest-pipeline";

type ErrorOrSuccess<T> = {
  result: 'error',
  error: ErrorResponse,
} | {
  result: 'success',
  value: T
}

export async function validate(client: ResourceManagementClient, resourceGroup: string, deployment: Deployment): Promise<ErrorOrSuccess<DeploymentPropertiesExtended>> {
  try {
    const result = await client.deployments.beginValidateAndWait(resourceGroup, 'foo', deployment);
    if (result.error) {
      return { result: 'error', error: result.error };
    }

    return { result: 'success', value: result };
  } catch (e) {
    return { result: 'error', error: parseError(e) };
  }
}

export async function whatif(client: ResourceManagementClient, resourceGroup: string, deployment: DeploymentWhatIf): Promise<ErrorOrSuccess<WhatIfChange[]>> {
  try {
    const result = await client.deployments.beginWhatIfAndWait(resourceGroup, 'foo', deployment);
    if (result.error) {
      return { result: 'error', error: result.error };
    }

    return { result: 'success', value: result.changes! };
  } catch (e) {
    return { result: 'error', error: parseError(e) };
  }
}

function parseError(error: any): ErrorResponse {
  if (!(error instanceof RestError)) {
    return {
      message: `${error}`,
    };
  }

  const errorResponse = (error.details as CloudError).error;
  if (!errorResponse) {
    return {
      message: 'Failed to parse error response',
    }
  }

  return errorResponse;
}