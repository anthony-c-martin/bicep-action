"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core_1 = require("@actions/core");
async function getInputs() {
    const action = (0, core_1.getInput)("action", { required: true });
    const config = (0, core_1.getInput)("config", { required: true });
    return {
        action,
        config
    };
}
exports.getInputs = getInputs;
//# sourceMappingURL=inputs.js.map