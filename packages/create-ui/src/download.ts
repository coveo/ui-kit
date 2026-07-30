/**
 * Downloads a template's npm package and extracts it into a destination
 * directory.
 *
 * Uses `pacote` to resolve, fetch, and extract the package in one step.
 * Pacote honours `npm_config_registry` and handles retries, auth, and
 * integrity verification out of the box.
 */

import pacote, {type Packument} from 'pacote';
import {TemplateVersionUnavailableError} from './errors.js';

export async function downloadTemplate(options: {
  packageName: string;
  destDir: string;
  version?: string;
}): Promise<string> {
  const {packageName, destDir, version} = options;
  const pacoteOptions = {packumentCache: new Map<string, Packument>()};

  if (version !== undefined) {
    await assertVersionPublished(packageName, version, pacoteOptions);
  }

  const spec = version ? `${packageName}@${version}` : packageName;
  await pacote.extract(spec, destDir, pacoteOptions);

  return destDir;
}

async function assertVersionPublished(
  packageName: string,
  version: string,
  pacoteOptions: {packumentCache: Map<string, Packument>}
): Promise<void> {
  const packument = await pacote.packument(packageName, pacoteOptions);
  const distTags = packument['dist-tags'];
  const versions = packument.versions;
  if (!Object.hasOwn(distTags, version) && !Object.hasOwn(versions, version)) {
    throw new TemplateVersionUnavailableError(version);
  }
}
