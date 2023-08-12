import util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

export async function bicepBuild(path: string) {
  const { stdout, stderr } = await execAsync(`bicep build --stdout ${path}`);

  if (stderr) {
    console.error(stderr);
  }
  return stdout;
}