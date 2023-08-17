import { it, describe } from "@jest/globals";
import {
  AzCliTestRecorder,
  expectBaselineToMatch,
  isBaselineRecordEnabled
} from "./utils";
import { validateAndGetMarkdown, whatIfAndGetMarkdown } from "../src/run";

const subscriptionId = "d08e1a72-8180-4ed3-8125-9dff7376b0bd";
const resourceGroup = "ant-test";

describe("scenarios", () => {
  const timeout = 60000;
  const recordMode = isBaselineRecordEnabled() ? "record" : "playback";
  const scenarios = [
    { name: "bicep-error" },
    { name: "static-error" },
    { name: "basic-success" },
    { name: "preflight-error" }
  ];

  // it.each(scenarios)(
  //   "validation produces the expected output ($name)",
  //   async (scenario) => {
  //     const basePath = `test/scenarios/${scenario.name}`;

  //     const azCli = new AzCliTestRecorder(
  //       `${basePath}/cli-validate.json`,
  //       recordMode
  //     );

  //     const markdown = await validateAndGetMarkdown(azCli, {
  //       subscriptionId: subscriptionId,
  //       resourceGroup: resourceGroup,
  //       templateFile: `${basePath}/main.bicep`,
  //       parametersFile: `${basePath}/main.bicepparam`
  //     });

  //     await expectBaselineToMatch(`${basePath}/validate.md`, markdown);
  //   },
  //   timeout
  // );

  it.each(scenarios)(
    "whatif produces the expected output ($name)",
    async (scenario) => {
      const basePath = `test/scenarios/${scenario.name}`;

      const azCli = new AzCliTestRecorder(
        `${basePath}/cli-whatif.json`,
        recordMode
      );

      const markdown = await whatIfAndGetMarkdown(azCli, {
        subscriptionId: subscriptionId,
        resourceGroup: resourceGroup,
        templateFile: `${basePath}/main.bicep`,
        parametersFile: `${basePath}/main.bicepparam`
      });

      await expectBaselineToMatch(`${basePath}/whatif.md`, markdown);
    },
    timeout
  );
});
