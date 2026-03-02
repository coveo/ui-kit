import {readFile, rename, unlink, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {DELTAS_DIR} from '../shared/constants.js';
import type {DeltaEntry} from '../shared/types.js';

export const PROGRESS_FILE = path.join(DELTAS_DIR, '.ai-audit-progress.json');
export const PROGRESS_TMP = `${PROGRESS_FILE}.tmp`;

export interface ProgressState {
  startedAt: string;
  model: string;
  surface: string;
  completedComponents: Set<string>;
  entries: DeltaEntry[];
}

export interface ProgressLoadOptions {
  resume: boolean;
}

export async function loadProgress(
  options: ProgressLoadOptions
): Promise<ProgressState | null> {
  if (!options.resume) return null;

  try {
    const content = await readFile(PROGRESS_FILE, 'utf8');
    const data = JSON.parse(content) as {
      startedAt: string;
      model: string;
      surface: string;
      completedComponents: string[];
      entries: DeltaEntry[];
    };
    console.log(
      `Resuming from previous run: ${data.completedComponents.length} components already completed.`
    );
    return {
      ...data,
      completedComponents: new Set(data.completedComponents),
    };
  } catch {
    console.log('No previous progress found. Starting fresh.');
    return null;
  }
}

export interface ProgressSaveOptions {
  model: string;
  surface: string;
}

export async function saveProgress(
  progressState: ProgressState,
  options: ProgressSaveOptions
): Promise<void> {
  const serializable = {
    startedAt: progressState.startedAt,
    model: options.model,
    surface: options.surface,
    completedComponents: [...progressState.completedComponents],
    entries: progressState.entries,
  };
  const json = JSON.stringify(serializable, null, 2);
  await writeFile(PROGRESS_TMP, json, 'utf8');
  await rename(PROGRESS_TMP, PROGRESS_FILE);
}

export async function clearProgress(): Promise<void> {
  try {
    await unlink(PROGRESS_FILE);
  } catch {
    // File doesn't exist - nothing to clean up
  }
}
