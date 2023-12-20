"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTableToString = exports.combine = exports.getWhatIfTable = exports.getResultHeading = exports.getErrorTable = void 0;
function getErrorTable(errors) {
    var _a, _b, _c;
    const errQueue = errors.slice();
    const rows = [["Code", "Message", "Target"]];
    while (errQueue.length > 0) {
        const current = errQueue.shift();
        if (current.details) {
            errQueue.push(...current.details);
        }
        rows.push([
            (_a = current.code) !== null && _a !== void 0 ? _a : "",
            (_b = current.message) !== null && _b !== void 0 ? _b : "",
            (_c = current.target) !== null && _c !== void 0 ? _c : ""
        ]);
    }
    return rows;
}
exports.getErrorTable = getErrorTable;
function getResultHeading(title, success) {
    if (success) {
        return `## ${title}
✅ Success!`;
    }
    else {
        return `## ${title}
❌ Failure!`;
    }
}
exports.getResultHeading = getResultHeading;
function getWhatIfTable(changes) {
    const rows = changes.map((x) => [
        x.resourceId,
        x.changeType,
        `<pre>${JSON.stringify(x.delta)}</pre>`
    ]);
    rows.unshift(["Resource Id", "Change Type", "Change"]);
    return rows;
}
exports.getWhatIfTable = getWhatIfTable;
function combine(values) {
    return values.join("\n\n");
}
exports.combine = combine;
function convertTableToString(rows) {
    const header = rows[0];
    const mdRows = [
        `| ${header.join(" | ")} |`,
        `|${header.map(() => "-").join("|")} |`,
        ...rows.slice(1).map((row) => `| ${row.join(" | ")} |`)
    ];
    return mdRows.join("\n");
}
exports.convertTableToString = convertTableToString;
//# sourceMappingURL=markdown.js.map