import {describe, expect, it} from 'vitest';

import {buildInvocationMessages} from '../lib/chatContextBuilder.js';
import type {Message} from '../types/agent.js';

describe('buildInvocationMessages', () => {
  it('keeps user messages and trims assistant text', () => {
    const input: Message[] = [
      {id: 'u1', role: 'user', content: 'Find jackets'},
      {id: 'a1', role: 'assistant', content: '  Here are options  '},
    ];

    expect(buildInvocationMessages(input)).toEqual([
      {id: 'u1', role: 'user', content: 'Find jackets'},
      {id: 'a1', role: 'assistant', content: 'Here are options'},
    ]);
  });

  it('injects serialized activity context into assistant message', () => {
    const input: Message[] = [
      {
        id: 'a1',
        role: 'assistant',
        content: 'Recommended products',
        activities: [
          {
            id: 'act1',
            activityType: 'a2ui-surface',
            content: {products: [{name: 'shoe'}]},
          },
        ],
      },
    ];

    const result = buildInvocationMessages(input);

    expect(result).toHaveLength(1);
    expect(result[0].content).toContain('Recommended products');
    expect(result[0].content).toContain('Activity context:');
  });

  it('drops empty assistant messages with no activities', () => {
    const input: Message[] = [
      {id: 'u1', role: 'user', content: 'Hi'},
      {id: 'a1', role: 'assistant', content: '   '},
    ];

    expect(buildInvocationMessages(input)).toEqual([
      {id: 'u1', role: 'user', content: 'Hi'},
    ]);
  });
});
