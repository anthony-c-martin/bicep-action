import { series } from 'async';

export function executeSynchronous<T>(asyncFunc: () => Promise<T>) {
  series(
    [asyncFunc],
    (error) => {
      if (error) {
        throw error;
      }
    });
}

export function isBaselineRecordEnabled() {
  // set to true to overwrite baselines
  return process.env['BASELINE_RECORD']?.toLowerCase() === 'true';
}