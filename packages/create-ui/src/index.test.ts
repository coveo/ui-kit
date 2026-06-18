import {describe, expect, it, vi} from 'vitest';
import {main, parseArgs} from './index.js';
import {availableTemplates, getTemplate, templates} from './templates.js';

describe('templates', () => {
  it('exposes the eight canonical templates', () => {
    expect(templates).toHaveLength(8);
  });

  it('maps template names to monorepo sample paths', () => {
    expect(getTemplate('headless-search-react')?.path).toBe(
      'samples/headless/search-react'
    );
    expect(getTemplate('atomic-search')?.path).toBe(
      'samples/atomic/search-vite'
    );
  });

  it('returns only available templates from availableTemplates()', () => {
    const names = availableTemplates().map((t) => t.name);
    expect(names).toContain('headless-search-react');
    expect(names).toContain('headless-commerce-react');
    expect(names).not.toContain('atomic-search');
  });

  it('returns undefined for an unknown template', () => {
    expect(getTemplate('does-not-exist')).toBeUndefined();
  });
});

describe('parseArgs', () => {
  it('reads the project name as the first positional', () => {
    expect(parseArgs(['my-app']).projectName).toBe('my-app');
  });

  it('reads the --template flag', () => {
    expect(
      parseArgs(['my-app', '--template', 'headless-search-react']).template
    ).toBe('headless-search-react');
  });

  it('supports -h/--help', () => {
    expect(parseArgs(['--help']).help).toBe(true);
    expect(parseArgs(['-h']).help).toBe(true);
    expect(parseArgs([]).help).toBe(false);
  });
});

describe('main (no-prompt paths)', () => {
  it('returns 0 for --help', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await main(['--help'])).toBe(0);
    spy.mockRestore();
  });

  it('returns 1 for an unknown template without prompting', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await main(['my-app', '--template', 'nope'])).toBe(1);
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('returns 1 for a not-yet-available template', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await main(['my-app', '--template', 'atomic-search'])).toBe(1);
    errSpy.mockRestore();
  });
});
