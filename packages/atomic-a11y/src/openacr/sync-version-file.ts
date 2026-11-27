import {writeFile} from 'node:fs/promises';
import {readOpenAcr, serializeOpenAcr} from './json-to-openacr.js';
import {syncProductVersion} from './report-dates.js';

/**
 * Sets `product.version` in an OpenACR YAML file without re-running the
 * evaluation (see {@link syncProductVersion} for the date rules). The file is
 * written only when the version changes; format it with oxfmt afterwards.
 *
 * Throws if the file is missing or is not an OpenACR report.
 *
 * @returns Whether the file changed, and the version it targeted before.
 */
export async function syncOpenAcrVersionFile(
  openAcrFile: string,
  version: string,
  today?: string
): Promise<{changed: boolean; previousVersion: string}> {
  const current = await readOpenAcr(openAcrFile);
  if (!current) {
    throw new Error(`No OpenACR report found at ${openAcrFile}`);
  }

  const previousVersion = current.product.version;
  const {report, changed} = syncProductVersion(current, version, today);
  if (changed) {
    await writeFile(openAcrFile, serializeOpenAcr(report), 'utf8');
  }
  return {changed, previousVersion};
}
