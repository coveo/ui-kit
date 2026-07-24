import {afterEach, describe, expect, it, vi} from 'vitest';
import {main, parseArgs, unavailableTemplateMessage} from './index.js';
import {describeTemplate, getTemplate} from './templates.js';
import {downloadTemplate, TemplateVersionUnavailableError} from './download.js';

vi.mock('./download.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./download.js')>();
  return {...actual, downloadTemplate: vi.fn()};
});

describe('templates', () => {
  it('resolves names to package names, and unknown names to undefined', () => {
    expect(getTemplate('headless-search-react')?.packageName).toBe(
      '@coveo/ui-kit-sample-headless-search-react'
    );
    expect(getTemplate('does-not-exist')).toBeUndefined();
  });

  it('identifies the package used by each Headless SSR template', () => {
    expect(describeTemplate(getTemplate('headless-ssr-commerce-nextjs')!)).toBe(
      'Headless SSR Commerce SSR (Next.js App Router, @coveo/headless-react)'
    );
    expect(
      describeTemplate(getTemplate('headless-ssr-commerce-express')!)
    ).toBe('Headless SSR Commerce SSR (Express, @coveo/headless/ssr)');
  });

  it('describes a template with its library, without the "UI" suffix', () => {
    const template = getTemplate('atomic-search')!;
    expect(describeTemplate(template)).toBe('Atomic Search (Vite)');
    expect(describeTemplate(template)).not.toContain('UI');
  });
});

describe('parseArgs', () => {
  it('reads the project name and --template', () => {
    const args = parseArgs(['my-app', '--template', 'headless-search-react']);
    expect(args.projectName).toBe('my-app');
    expect(args.template).toBe('headless-search-react');
  });

  it('reads --template-version', () => {
    const args = parseArgs([
      'my-app',
      '--template',
      'headless-search-react',
      '--template-version',
      '3.2.1',
    ]);
    expect(args.templateVersion).toBe('3.2.1');
  });

  it('leaves templateVersion undefined when omitted', () => {
    expect(parseArgs(['my-app']).templateVersion).toBeUndefined();
    expect(parseArgs([]).templateVersion).toBeUndefined();
  });

  it('coerces an empty/whitespace --template-version to undefined', () => {
    expect(parseArgs(['--template-version', '   ']).templateVersion).toBeUndefined();
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
  afterEach(() => {
    vi.mocked(downloadTemplate).mockReset();
  });

  it('returns 0 for --help and lists templates without the "UI" suffix', async () => {
    const chunks: string[] = [];
    const out = vi.spyOn(process.stdout, 'write').mockImplementation((c) => {
      chunks.push(String(c));
      return true;
    });
    expect(await main(['--help'])).toBe(0);
    out.mockRestore();
    const help = chunks.join('');
    expect(help).toContain('Atomic Search (Vite)');
    expect(help).toContain('--template-version');
    expect(help).toMatch(/defaults\s+to\s+latest/i);
    expect(help).toContain('headless-search-react --template-version 3.2.1');
  });

  it('returns 0 for --docs and prints the documentation links', async () => {
    const chunks: string[] = [];
    const out = vi.spyOn(process.stdout, 'write').mockImplementation((c) => {
      chunks.push(String(c));
      return true;
    });
    expect(await main(['--docs'])).toBe(0);
    out.mockRestore();
    const output = chunks.join('');
    expect(output).toContain('https://docs.coveo.com');
    expect(output).toContain('https://docs.coveo.com/en/atomic/latest');
    expect(output).toContain('https://docs.coveo.com/en/headless/latest');
  });

  it('returns 1 for an invalid --template', async () => {
    const out = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    expect(await main(['my-app', '--template', 'nope'])).toBe(1);
    out.mockRestore();
  });

  it('threads --template-version through to downloadTemplate', async () => {
    vi.mocked(downloadTemplate).mockRejectedValue(new Error('stop-after-capture'));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      main(['my-app', '--template', 'headless-search-react', '--template-version', '3.2.1'])
    ).rejects.toThrow();

    expect(downloadTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        packageName: '@coveo/ui-kit-sample-headless-search-react',
        version: '3.2.1',
      })
    );
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('forwards an undefined version when --template-version is omitted', async () => {
    vi.mocked(downloadTemplate).mockRejectedValue(new Error('stop-after-capture'));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(main(['my-app', '--template', 'headless-search-react'])).rejects.toThrow();

    expect(downloadTemplate).toHaveBeenCalledWith(expect.objectContaining({version: undefined}));
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('reports a version-aware error when the requested version is unavailable', async () => {
    vi.mocked(downloadTemplate).mockRejectedValue(new TemplateVersionUnavailableError('99.99.99'));
    const outSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      main(['my-app', '--template', 'headless-search-react', '--template-version', '99.99.99'])
    ).rejects.toThrow('Template "headless-search-react" version "99.99.99" is not available.');

    outSpy.mockRestore();
    logSpy.mockRestore();
    errSpy.mockRestore();
  });
});

describe('unavailableTemplateMessage', () => {
  it('includes the version when one was provided', () => {
    expect(unavailableTemplateMessage('headless-search-react', '3.2.1')).toBe(
      'Template "headless-search-react" version "3.2.1" is not available.'
    );
  });

  it('omits the version when none was provided', () => {
    expect(unavailableTemplateMessage('headless-search-react')).toBe(
      'Template "headless-search-react" is not available.'
    );
  });
});
