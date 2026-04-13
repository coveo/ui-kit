import {describe, expect, it} from 'vitest';

import {generateId} from '../lib/chatIds.js';

describe('chatIds', () => {
  it('generates thread IDs with expected prefix', () => {
    expect(generateId('thread')).toMatch(/^thread-/);
  });

  it('generates user message IDs with expected prefix', () => {
    expect(generateId('msg-user')).toMatch(/^msg-user-/);
  });

  it('generates assistant message IDs with expected prefix', () => {
    expect(generateId('msg-assistant')).toMatch(/^msg-assistant-/);
  });
});
