import {describe, expect, it, vi} from 'vitest';
import {main, parseArgs} from './index.js';
import {describeTemplate, getTemplate} from './templates.js';

describe('templates', () => {
  it('resolves names to package names, and unknown names to undefined', () => {
    expect(getTemplate('headless-search-react')?.packageName).toBe(
      '@coveo/sample-headless-search-react'
    );
    expect(getTemplate('does-not-exist')).toBeUndefined();
  });

  it('describes a template with its library, without the "UI" suffix', () => {
    const template = getTemplate('atomic-search')!;
    expect(describeTemplate(template)).toBe('Atomic Search (vanilla + Vite)');
    expect(describeTemplate(template)).not.toContain('UI');
  });
});

describe('parseArgs', () => {
  it('reads the project name and --template', () => {
    const args = parseArgs(['my-app', '--template', 'headless-search-react']);
    expect(args.projectName).toBe('my-app');
    expect(args.template).toBe('headless-search-react');
  });

  it('rejects the removed --ref flag as an unknown option', () => {
    expect(() =>
      parseArgs(['my-app', '--template', 'headless-search-react', '--ref', 'x'])
    ).toThrow();
  });

  it('parses --docs and leaves optional flags undefined/false by default', () => {
    expect(parseArgs(['--docs']).docs).toBe(true);
    const none = parseArgs([]);
    expect(none.docs).toBe(false);
    expect(none.template).toBeUndefined();
  });
});

describe('main', () => {
  it('returns 0 for --help and lists templates without the "UI" suffix', async () => {
    const chunks: string[] = [];
    const out = vi.spyOn(process.stdout, 'write').mockImplementation((c) => {
      chunks.push(String(c));
      return true;
    });
    expect(await main(['--help'])).toBe(0);
    out.mockRestore();
    const help = chunks.join('');
    expect(help).toContain('Atomic Search (vanilla + Vite)');
    // The redundant "<use case> UI (" suffix must be gone from every template.
    expect(help).not.toContain('UI (');
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
