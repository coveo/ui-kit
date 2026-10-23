import {describe, expect, it} from 'vitest';
import {getAgUiPath, resolveConverseAgent} from './converse-path.js';

describe('resolveConverseAgent', () => {
  it('addresses the commerce agent by default', () => {
    expect(resolveConverseAgent(undefined)).toBe('commerce');
    expect(resolveConverseAgent('  ')).toBe('commerce');
  });

  it('addresses the configured agent', () => {
    expect(resolveConverseAgent(' question-answering ')).toBe('question-answering');
  });

  it('rejects a value that is not a single path segment', () => {
    expect(() => resolveConverseAgent('commerce/agui')).toThrow(/VITE_COVEO_AGENT/);
    expect(() => resolveConverseAgent('../admin')).toThrow(/VITE_COVEO_AGENT/);
  });
});

describe('getAgUiPath', () => {
  it("is the agent's AG-UI path in the organization", () => {
    expect(getAgUiPath('myorg', 'question-answering')).toBe(
      '/api/preview/organizations/myorg/agents/question-answering/agui'
    );
  });
});
