/**
 * Small filesystem predicates shared across the scaffolding steps.
 */

import {readdir} from 'node:fs/promises';

export async function isEmptyOrMissing(dir: string): Promise<boolean> {
  try {
    return (await readdir(dir)).length === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return true;
    }
    throw error;
  }
}
