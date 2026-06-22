import {describe, expect, it, vi} from 'vitest';
import {main, parseArgs} from './index.js';
import {getTemplate} from './templates.js';

describe('templates', () => {
  it('resolves names to sample paths, and unknown names to undefined', () => {
    expect(getTemplate('headless-search-react')?.path).toBe(
      'samples/headless/search-react'
    );
    expect(getTemplate('does-not-exist')).toBeUndefined();
  });
});

describe('parseArgs', () => {
  it('reads the project name and --template', () => {
    const args = parseArgs(['my-app', '--template', 'headless-search-react']);
    expect(args.projectName).toBe('my-app');
    expect(args.template).toBe('headless-search-react');
  });

  it('reads the advanced --ref flag', () => {
    const args = parseArgs([
      'my-app',
      '--template',
      'headless-search-react',
      '--ref',
      'my-feature-branch',
    ]);
    expect(args.ref).toBe('my-feature-branch');
  });

  it('parses --docs and leaves optional flags undefined/false by default', () => {
    expect(parseArgs(['--docs']).docs).toBe(true);
    const none = parseArgs([]);
    expect(none.docs).toBe(false);
    expect(none.ref).toBeUndefined();
    expect(none.template).toBeUndefined();
  });
});

describe('main', () => {
  it('returns 0 for --help (commander prints the usage)', async () => {
    const out = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    expect(await main(['--help'])).toBe(0);
    out.mockRestore();
  });

  it('returns 0 for --docs and prints the documentation links', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await main(['--docs'])).toBe(0);
    const output = spy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('https://docs.coveo.com');
    expect(output).toContain('https://docs.coveo.com/en/atomic/latest');
    expect(output).toContain('https://docs.coveo.com/en/headless/latest');
    spy.mockRestore();
  });

  it('returns 1 for an invalid --template', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await main(['my-app', '--template', 'nope'])).toBe(1);
    logSpy.mockRestore();
    errSpy.mockRestore();
  });
});
