"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const inputs_1 = require("./inputs");
const promises_1 = require("fs/promises");
const bicep_node_1 = require("bicep-node");
const os_1 = __importDefault(require("os"));
const core_rest_pipeline_1 = require("@azure/core-rest-pipeline");
const arm_resources_1 = require("@azure/arm-resources");
const identity_1 = require("@azure/identity");
const markdown_1 = require("./markdown");
const path_1 = __importDefault(require("path"));
async function run() {
    const inputs = await (0, inputs_1.getInputs)();
    const configPath = path_1.default.resolve(inputs.config);
    const config = JSON.parse(await (0, promises_1.readFile)(configPath, "utf8"));
    const bicepParamsPath = path_1.default.join(path_1.default.dirname(configPath), config.bicepParamsFile);
    if (inputs.action !== "validate") {
        throw `Unsupported action: ${inputs.action}`;
    }
    const bicepPath = await bicep_node_1.Bicep.install(os_1.default.tmpdir(), config.bicepVersion);
    const result = await (0, exec_1.getExecOutput)(bicepPath, ["build-params", "--stdout", bicepParamsPath], {
        silent: true,
        env: {
            BICEP_PARAMETERS_OVERRIDES: JSON.stringify(config.paramOverrides || {})
        }
    });
    if (result.exitCode !== 0) {
        throw result.stderr;
    }
    const buildParamsOutput = JSON.parse(result.stdout);
    if (!buildParamsOutput.templateJson) {
        throw "Template JSON not found in build-params output";
    }
    const client = new arm_resources_1.ResourceManagementClient(new identity_1.AzureCliCredential(), config.subscriptionId);
    const template = JSON.parse(buildParamsOutput.templateJson);
    const { parameters } = JSON.parse(buildParamsOutput.parametersJson);
    const scope = `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}`;
    let error;
    try {
        const poller = await client.deployments.beginValidateAtScope(scope, config.name || "bicep-action", {
            properties: {
                template,
                parameters,
                mode: "Incremental"
            }
        });
        const validateResult = await poller.pollUntilDone();
        error = validateResult.error;
    }
    catch (e) {
        error = parseError(e);
    }
    if (error === null || error === void 0 ? void 0 : error.details) {
        const markdown = (0, markdown_1.combine)([
            (0, markdown_1.getResultHeading)("Validate Results", false),
            (0, markdown_1.convertTableToString)((0, markdown_1.getErrorTable)(error.details))
        ]);
        core_1.summary.addRaw(markdown).write();
        (0, core_1.setFailed)("Validation failed");
    }
    else {
        const markdown = (0, markdown_1.getResultHeading)("Validate Results", true);
        core_1.summary.addRaw(markdown).write();
    }
}
function parseError(error) {
    if (error instanceof core_rest_pipeline_1.RestError) {
        return error.details.error;
    }
    return {
        message: `${error}`
    };
}
run();
//# sourceMappingURL=main.js.map