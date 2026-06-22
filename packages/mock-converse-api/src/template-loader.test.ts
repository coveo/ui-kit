import {describe, it, expect, beforeEach} from 'vitest';
import {loadTemplate, clearTemplateCache} from './template-loader.js';
import type {TemplateId} from './types.js';

describe('loadTemplate', () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it('loads a template file and returns its content', async () => {
    const content = await loadTemplate('response1');
    expect(content).toBeTypeOf('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('returns cached content on subsequent calls', async () => {
    const first = await loadTemplate('response2');
    const second = await loadTemplate('response2');
    expect(first).toBe(second);
  });

  it('loads all five template files successfully', async () => {
    const templateIds: TemplateId[] = [
      'response1',
      'response2',
      'response3',
      'response4',
      'response5',
    ];

    for (const id of templateIds) {
      const content = await loadTemplate(id);
      expect(content).toBeTypeOf('string');
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it('throws a fatal error for a missing template file', async () => {
    await expect(loadTemplate('nonexistent' as TemplateId)).rejects.toThrow(
      /Fatal: template file not found/
    );
  });

  it('contains SSE event format in loaded templates', async () => {
    const content = await loadTemplate('response1');
    expect(content).toContain('event:');
    expect(content).toContain('data:');
  });

  it('contains SSE event format in fallback template', async () => {
    const content = await loadTemplate('response5');
    expect(content).toContain('event:');
    expect(content).toContain('data:');
  });
});
