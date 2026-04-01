/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */

import type {RunAgentInput} from '@ag-ui/client';
import {describe, expect, it} from 'vitest';
import {AnswerAgent} from './answer-agent.js';

describe('AnswerAgent', () => {
  const buildRequest = (forwardedProps: RunAgentInput['forwardedProps']) => {
    const agent = new AnswerAgent({url: 'https://example.com/answer'});

    return (agent as any).requestInit({forwardedProps});
  };

  it('includes recordDebugSession when forwarded', () => {
    const request = buildRequest({
      params: {query: 'hello'},
      accessToken: 'token',
      recordDebugSession: true,
    });

    expect(JSON.parse(request.body as string)).toEqual({
      query: 'hello',
      recordDebugSession: true,
    });
  });

  it('omits recordDebugSession when not forwarded', () => {
    const request = buildRequest({
      params: {query: 'hello'},
      accessToken: 'token',
    });

    expect(JSON.parse(request.body as string)).toEqual({
      query: 'hello',
    });
  });
});
