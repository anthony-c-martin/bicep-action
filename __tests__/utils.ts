import { expect } from '@jest/globals'
import { ExecOutput } from "@actions/exec";
import { AzCli, AzCliWrapper } from "../src/azcli";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";

export function isBaselineRecordEnabled() {
  // set to true to overwrite baselines
  return process.env['BASELINE_RECORD']?.toLowerCase() === 'true';
}

type ExecuteRecording = {
  arguments: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function expectBaselineToMatch(baselinePath: string, contents: string) {
  const savedValue = existsSync(baselinePath) ? await readFile(baselinePath, { encoding: 'utf-8' }) : null;
  if (isBaselineRecordEnabled()) {
    await writeFile(baselinePath, contents);
  }

  expect(contents).toBe(savedValue);
}

export class AzCliTestRecorder implements AzCliWrapper {
  constructor(
    public readonly filePath: string,
    public readonly mode: 'record' | 'playback',
  ) {}

  async execute(parameters: string[]): Promise<ExecOutput> {
    switch (this.mode) {
      case 'playback': {
        try {
          const file = await readFile(this.filePath, { encoding: 'utf-8' });

          const output: ExecuteRecording = JSON.parse(file);
          if (output.arguments !== parameters.join(' ')) {
            throw 'Saved command doesnt match current command';
          }

          return output;
        } catch (e) {
          throw `Caught error, try running 'npm run text:fix'. Error: ${e}`;
        }
      }
      case 'record': {
        const result = await new AzCli().execute(parameters);
        const resultWithCommand: ExecuteRecording = {
          arguments: parameters.join(' '),
          ...result,
        }
        const file = JSON.stringify(resultWithCommand, null, 2);
        await writeFile(this.filePath, file, { encoding: 'utf-8' });

        return result;
      }
    }
  }
}