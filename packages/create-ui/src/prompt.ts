/**
 * Interactive prompts shown when arguments are omitted. The choice-building
 * logic is kept pure so it can be unit-tested without a TTY.
 */

import {cancel, isCancel, select, text} from '@clack/prompts';
import {getTemplates, type Library, type Template} from './templates.js';

const LIBRARY_LABELS: Record<Library, string> = {
  atomic: 'Atomic',
  headless: 'Headless',
};

export interface TemplateChoice {
  label: string;
  value: string;
  hint?: string;
}

/**
 * Pure: builds the select options from the available templates, prefixing each
 * with its library label so options read e.g. "Headless — search (React)".
 */
export function buildTemplateChoices(
  templates: Template[] = getTemplates()
): TemplateChoice[] {
  return templates.map((t) => ({
    label: `${LIBRARY_LABELS[t.library]} — ${t.description}`,
    value: t.name,
    hint: t.description,
  }));
}

function handleCancel(value: unknown): asserts value is string {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(130);
  }
}

/** Prompts the user to pick a template from the available list. */
export async function selectTemplate(): Promise<Template> {
  const value = await select({
    message: 'Which template would you like to use?',
    options: buildTemplateChoices(),
  });
  handleCancel(value);
  return getTemplates().find((t) => t.name === value)!;
}

/** Prompts for a project name, defaulting to a sensible value. */
export async function promptProjectName(
  defaultName = 'my-coveo-app'
): Promise<string> {
  const value = await text({
    message: 'Project name:',
    placeholder: defaultName,
    defaultValue: defaultName,
    validate: (v) =>
      (v ?? '').trim().length > 0 ? undefined : 'Please enter a project name.',
  });
  handleCancel(value);
  return value.trim();
}
