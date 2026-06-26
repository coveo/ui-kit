import {describe, expect, it} from 'vitest';
import {buildTemplateChoices} from './prompt.js';
import type {Template} from './templates.js';

const sample: Template[] = [
  {
    name: 'headless-search-react',
    library: 'headless',
    description: 'Headless search UI (React)',
    packageName: '@coveo/sample-headless-search-react',
  },
  {
    name: 'atomic-search',
    library: 'atomic',
    description: 'Atomic search UI (vanilla + Vite)',
    packageName: '@coveo/sample-atomic-search',
  },
];

describe('buildTemplateChoices', () => {
  it('builds labelled choices keyed by template name', () => {
    const choices = buildTemplateChoices(sample);
    expect(choices).toEqual([
      {
        label: 'Headless search UI (React)',
        value: 'headless-search-react',
      },
      {
        label: 'Atomic search UI (vanilla + Vite)',
        value: 'atomic-search',
      },
    ]);
  });

  it('defaults to the registered templates', () => {
    const values = buildTemplateChoices().map((c) => c.value);
    expect(values).toContain('headless-search-react');
  });
});
