import { ErrorResponse } from "@azure/arm-resources";


export function getErrorTable(error: ErrorResponse) {
  return `| Field | Data |
|-|-|
| Code | ${error.code} |
| Message | ${error.message} |
`;
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

export function combine(values: string[]) {
  return values.join('\n\n');
}