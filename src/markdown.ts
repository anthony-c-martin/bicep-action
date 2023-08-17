import { ErrorResponse, WhatIfChange } from "@azure/arm-resources";

export function getErrorTable(errors: ErrorResponse[]) {
  const errQueue = errors.slice();
  const rows: string[][] = [];

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

  return getTable(["Code", "Message", "Target"], rows);
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
  return getTable(
    ["Resource Id", "Change Type", "Change"],
    changes.map((x) => [
      x.resourceId,
      x.changeType,
      `<pre>${JSON.stringify(x.delta)}</pre>`
    ])
  );
}

export function combine(values: string[]) {
  return values.join("\n\n");
}

function getTable(header: string[], rows: string[][]) {
  const mdRows = [
    `| ${header.join(" | ")} |`,
    `|${header.map(() => "-").join("|")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ];

  return mdRows.join("\n");
}
