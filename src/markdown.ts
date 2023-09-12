import { ErrorResponse, WhatIfChange } from "@azure/arm-resources";

export function getErrorTable(errors: ErrorResponse[]) {
  const errQueue = errors.slice();
  const rows: string[][] = [["Code", "Message", "Target"]];

  while (errQueue.length > 0) {
    const current = errQueue.shift()!;
    if (current.details) {
      errQueue.push(...current.details);
    }

    rows.push([
      current.code ?? "",
      current.message ?? "",
      current.target ?? ""
    ]);
  }

  return rows;
}

export function getResultHeading(title: string, success: boolean) {
  if (success) {
    return `## ${title}
✅ Success!`;
  } else {
    return `## ${title}
❌ Failure!`;
  }
}

export function getWhatIfTable(changes: WhatIfChange[]) {
  const rows = changes.map((x) => [
    x.resourceId,
    x.changeType,
    `<pre>${JSON.stringify(x.delta)}</pre>`
  ]);
  rows.unshift(["Resource Id", "Change Type", "Change"]);
  return rows;
}

export function combine(values: string[]) {
  return values.join("\n\n");
}

export function convertTableToString(rows: string[][]) {
  const header = rows[0];
  const mdRows = [
    `| ${header.join(" | ")} |`,
    `|${header.map(() => "-").join("|")} |`,
    ...rows.slice(1).map((row) => `| ${row.join(" | ")} |`)
  ];

  return mdRows.join("\n");
}
