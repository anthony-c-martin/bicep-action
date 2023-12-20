import { getInput } from "@actions/core";

export type Inputs = {
  config: string;
  action: string;
};

export async function getInputs(): Promise<Inputs> {
  const action = getInput("action", { required: true });
  const config = getInput("config", { required: true });

  return {
    action,
    config
  };
}
