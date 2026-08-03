import {describe, expect, it} from 'vitest';
import {buildLibraryChoices, buildTemplateChoices} from './prompt.js';
import type {Template} from './templates.js';

const sample: Template[] = [
  {
    name: 'headless-search-react',
    library: 'headless',
    label: 'Search (React)',
    packageName: '@coveo/ui-kit-sample-headless-search-react',
    firstSupportedVersion: '3.53.1',
  },
  {
    name: 'atomic-search',
    library: 'atomic',
    label: 'Search (Vite)',
    packageName: '@coveo/ui-kit-sample-atomic-search',
    firstSupportedVersion: '3.60.1',
  },
  {
    name: 'atomic-commerce',
    library: 'atomic',
    label: 'Commerce (Vite)',
    packageName: '@coveo/ui-kit-sample-atomic-commerce',
    firstSupportedVersion: '3.60.1',
  },
];

describe('buildLibraryChoices', () => {
  it('lists each present library once, in library order, with a hint', () => {
    expect(buildLibraryChoices(sample)).toEqual([
      {
        value: 'atomic',
        label: 'Atomic',
        hint: 'Pre-built, customizable web components',
      },
      {
        value: 'headless',
        label: 'Headless',
        hint: 'Framework-agnostic state, you build the UI',
      },
    ]);
  });

  it('omits libraries that have no templates', () => {
    const values = buildLibraryChoices(sample).map((c) => c.value);
    expect(values).not.toContain('headless-ssr');
  });

  it('defaults to the registered templates', () => {
    const values = buildLibraryChoices().map((c) => c.value);
    expect(values).toEqual(['atomic', 'headless', 'headless-ssr']);
  });
});

describe('buildTemplateChoices', () => {
  it('maps templates to flat label/value choices', () => {
    const atomic = sample.filter((t) => t.library === 'atomic');
    expect(buildTemplateChoices(atomic)).toEqual([
      {value: 'atomic-search', label: 'Search (Vite)'},
      {value: 'atomic-commerce', label: 'Commerce (Vite)'},
    ]);
  });

  it('drops the redundant "UI" suffix from every label', () => {
    const labels = buildTemplateChoices(sample).map((c) => c.label);
    expect(labels.every((l) => !/\bUI\b/.test(l))).toBe(true);
  });
});
