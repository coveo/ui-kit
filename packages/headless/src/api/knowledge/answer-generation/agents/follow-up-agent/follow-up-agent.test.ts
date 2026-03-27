/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */

import type {RunAgentInput} from '@ag-ui/client';
import {describe, expect, it} from 'vitest';
import {FollowUpAgent} from './follow-up-agent.js';

describe('FollowUpAgent', () => {
  const buildRequest = (forwardedProps: RunAgentInput['forwardedProps']) => {
    const agent = new FollowUpAgent({url: 'https://example.com/follow-up'});

    return (agent as any).requestInit({forwardedProps});
  };

  it('includes recordDebugSession when forwarded', () => {
    const request = buildRequest({
      q: 'follow up',
      conversationId: 'conversation-123',
      conversationToken: 'token-123',
      accessToken: 'token',
      recordDebugSession: true,
    });

    expect(JSON.parse(request.body as string)).toEqual({
      q: 'follow up',
      conversationId: 'conversation-123',
      conversationToken: 'token-123',
      recordDebugSession: true,
    });
  });

  it('omits recordDebugSession when not forwarded', () => {
    const request = buildRequest({
      q: 'follow up',
      conversationId: 'conversation-123',
      conversationToken: 'token-123',
      accessToken: 'token',
    });

    expect(JSON.parse(request.body as string)).toEqual({
      q: 'follow up',
      conversationId: 'conversation-123',
      conversationToken: 'token-123',
    });
  });
});
