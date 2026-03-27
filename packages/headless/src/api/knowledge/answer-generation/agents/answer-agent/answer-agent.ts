import {HttpAgent, type RunAgentInput} from '@ag-ui/client';
import type {PlatformEnvironment} from '../../../../../utils/url-utils.js';
import {buildBaseAnswerGenerationUrl} from '../endpoint-url-builder.js';

/**
 * Custom HTTP Agent for answer requests
 */
export class AnswerAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    const {params, accessToken, recordDebugSession} =
      input.forwardedProps || {};
    const body = {
      ...params,
      ...(recordDebugSession && {recordDebugSession: true}),
    };
    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: this.abortController.signal,
    };
  }
}

export const createAnswerAgent = (
  agentId: string,
  organizationId: string,
  env: PlatformEnvironment
) =>
  new AnswerAgent({
    url: `${buildBaseAnswerGenerationUrl(agentId, organizationId, env)}/answer`,
  });
