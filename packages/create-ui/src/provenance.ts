import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {log} from './log.js';
import {extractCoveoDependencies, type ProjectMetadata} from './metadata.js';
import type {PackageJson} from './types.js';

const PROVENANCE_DIR = '.coveo';
const PROVENANCE_FILE = 'create-ui.json';

export function provenancePath(projectDir: string): string {
  return join(projectDir, PROVENANCE_DIR, PROVENANCE_FILE);
}

export interface SampleMetadata {
  templateVersion: string;
  dependencies: Record<string, string>;
}

export async function readSampleMetadata(
  sampleDir: string
): Promise<SampleMetadata> {
  const pkg = JSON.parse(
    await readFile(join(sampleDir, 'package.json'), 'utf8')
  ) as PackageJson;
  return {
    templateVersion: pkg.version ?? '',
    dependencies: extractCoveoDependencies(pkg),
  };
}

export async function writeProvenance(
  projectDir: string,
  metadata: ProjectMetadata
): Promise<boolean> {
  try {
    await mkdir(join(projectDir, PROVENANCE_DIR), {recursive: true});
    await writeFile(
      provenancePath(projectDir),
      `${JSON.stringify(metadata, null, 2)}\n`
    );
    return true;
  } catch {
    log.warn(
      'Could not write project metadata to .coveo/create-ui.json — ' +
        'continuing without it.'
    );
    return false;
  }
}

export async function readProvenance(
  projectDir: string
): Promise<ProjectMetadata | null> {
  try {
    const raw = await readFile(provenancePath(projectDir), 'utf8');
    return JSON.parse(raw) as ProjectMetadata;
  } catch {
    return null;
  }
}
