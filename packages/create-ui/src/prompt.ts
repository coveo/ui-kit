import {cancel, isCancel, select, text} from '@clack/prompts';
import {
  getTemplates,
  LIBRARIES,
  LIBRARY_ORDER,
  type Library,
  type Template,
} from './templates.js';

export interface Choice<Value extends string = string> {
  label: string;
  value: Value;
  hint?: string;
}

export function buildLibraryChoices(
  templates: Template[] = getTemplates()
): Choice<Library>[] {
  return LIBRARY_ORDER.filter((library) =>
    templates.some((t) => t.library === library)
  ).map((library) => ({
    value: library,
    label: LIBRARIES[library].label,
    hint: LIBRARIES[library].hint,
  }));
}

export function buildTemplateChoices(templates: Template[]): Choice[] {
  return templates.map((t) => ({value: t.name, label: t.label}));
}

function handleCancel(value: unknown): asserts value is string {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(130);
  }
}

async function selectLibrary(templates: Template[]): Promise<Library> {
  const choices = buildLibraryChoices(templates);
  if (choices.length === 1) {
    return choices[0].value;
  }
  const value = await select({
    message: 'Which Coveo library would you like to use?',
    options: choices,
    initialValue: choices[0]?.value,
  });
  handleCancel(value);
  return value as Library;
}

export async function selectTemplate(): Promise<Template> {
  const templates = getTemplates();
  const library = await selectLibrary(templates);

  const inLibrary = templates.filter((t) => t.library === library);
  const value = await select({
    message: `Which ${LIBRARIES[library].label} template would you like to use?`,
    options: buildTemplateChoices(inLibrary),
    initialValue: inLibrary[0]?.name,
  });
  handleCancel(value);

  const template = templates.find((t) => t.name === value);
  if (!template) {
    throw new Error(`No template matches the selected value "${value}".`);
  }
  return template;
}

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
