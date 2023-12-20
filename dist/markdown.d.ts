import { ErrorResponse, WhatIfChange } from "@azure/arm-resources";
export declare function getErrorTable(errors: ErrorResponse[]): string[][];
export declare function getResultHeading(title: string, success: boolean): string;
export declare function getWhatIfTable(changes: WhatIfChange[]): string[][];
export declare function combine(values: string[]): string;
export declare function convertTableToString(rows: string[][]): string;
//# sourceMappingURL=markdown.d.ts.map