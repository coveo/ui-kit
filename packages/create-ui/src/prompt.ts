/**
 * Interactive prompts shown when arguments are omitted. The interactive calls
 * are thin wrappers around @inquirer/prompts; the choice-building logic is kept
 * pure so it can be unit-tested without a TTY.
 */

import {input, select} from '@inquirer/prompts';
import {getTemplates, type Library, type Template} from './templates.js';

const LIBRARY_LABELS: Record<Library, string> = {
  atomic: 'Atomic',
  headless: 'Headless',
};

export interface TemplateChoice {
  name: string;
  value: string;
  description: string;
}

/**
 * Pure: builds the select choices from the available templates, prefixing each
 * with its library label so options read e.g. "Headless — search (React)".
 */
export function buildTemplateChoices(
  templates: Template[] = getTemplates()
): TemplateChoice[] {
  return templates.map((t) => ({
    name: `${LIBRARY_LABELS[t.library]} — ${t.description}`,
    value: t.name,
    description: t.description,
  }));
}

/** Prompts the user to pick a template from the available list. */
export async function selectTemplate(): Promise<Template> {
  const choices = buildTemplateChoices();
  const value = await select({
    message: 'Which template would you like to use?',
    choices,
  });
  // Safe: `value` is one of the available template names.
  return getTemplates().find((t) => t.name === value)!;
}

/** Prompts for a project name, defaulting to a sensible value. */
export async function promptProjectName(
  defaultName = 'my-coveo-app'
): Promise<string> {
  return input({
    message: 'Project name:',
    default: defaultName,
    validate: (value) =>
      value.trim().length > 0 ? true : 'Please enter a project name.',
  });
}
