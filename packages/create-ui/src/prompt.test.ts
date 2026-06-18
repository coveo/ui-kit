import {describe, expect, it} from 'vitest';
import {buildTemplateChoices} from './prompt.js';
import type {Template} from './templates.js';

const sample: Template[] = [
  {
    name: 'headless-search-react',
    library: 'headless',
    description: 'Headless search UI (React)',
    path: 'samples/headless/search-react',
    available: true,
  },
  {
    name: 'atomic-search',
    library: 'atomic',
    description: 'Atomic search UI (vanilla + Vite)',
    path: 'samples/atomic/search-vite',
    available: true,
  },
];

describe('buildTemplateChoices', () => {
  it('builds labelled choices keyed by template name', () => {
    const choices = buildTemplateChoices(sample);
    expect(choices).toEqual([
      {
        name: 'Headless — Headless search UI (React)',
        value: 'headless-search-react',
        description: 'Headless search UI (React)',
      },
      {
        name: 'Atomic — Atomic search UI (vanilla + Vite)',
        value: 'atomic-search',
        description: 'Atomic search UI (vanilla + Vite)',
      },
    ]);
  });

  it('defaults to the available templates', () => {
    const values = buildTemplateChoices().map((c) => c.value);
    expect(values).toContain('headless-search-react');
    expect(values).not.toContain('atomic-search');
  });
});
