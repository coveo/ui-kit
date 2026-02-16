import {isRecord} from '../shared/guards.js';

type YamlScalar = string | number | boolean | null;

function isYamlScalar(value: unknown): value is YamlScalar {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function stringifyYamlScalar(value: YamlScalar): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return String(value);
}

function renderYaml(value: unknown, indentationLevel = 0): string[] {
  const indentation = '  '.repeat(indentationLevel);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [`${indentation}[]`];
    }

    const lines: string[] = [];

    for (const entry of value) {
      if (isYamlScalar(entry)) {
        lines.push(`${indentation}- ${stringifyYamlScalar(entry)}`);
        continue;
      }

      const renderedEntry = renderYaml(entry, indentationLevel + 1);
      const [firstLine, ...remainingLines] = renderedEntry;
      lines.push(`${indentation}- ${firstLine.trimStart()}`);
      lines.push(...remainingLines);
    }

    return lines;
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(
      ([, entryValue]) => entryValue !== undefined
    );

    if (entries.length === 0) {
      return [`${indentation}{}`];
    }

    const lines: string[] = [];

    for (const [key, entryValue] of entries) {
      if (entryValue === undefined) {
        continue;
      }

      if (Array.isArray(entryValue) && entryValue.length === 0) {
        lines.push(`${indentation}${key}: []`);
        continue;
      }

      if (
        isRecord(entryValue) &&
        Object.entries(entryValue).filter(
          ([, nestedValue]) => nestedValue !== undefined
        ).length === 0
      ) {
        lines.push(`${indentation}${key}: {}`);
        continue;
      }

      if (isYamlScalar(entryValue)) {
        lines.push(`${indentation}${key}: ${stringifyYamlScalar(entryValue)}`);
        continue;
      }

      lines.push(`${indentation}${key}:`);
      lines.push(...renderYaml(entryValue, indentationLevel + 1));
    }

    return lines;
  }

  if (isYamlScalar(value)) {
    return [`${indentation}${stringifyYamlScalar(value)}`];
  }

  return [`${indentation}${JSON.stringify(value)}`];
}

export function toYAML(value: unknown): string {
  return `${renderYaml(value).join('\n')}\n`;
}
