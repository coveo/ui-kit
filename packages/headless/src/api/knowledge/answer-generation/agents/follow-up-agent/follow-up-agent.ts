import {HttpAgent, type RunAgentInput} from '@ag-ui/client';
import type {PlatformEnvironment} from '../../../../../utils/url-utils.js';
import {buildBaseAnswerGenerationUrl} from '../endpoint-url-builder.js';

/**
 * Custom HTTP Agent for follow-up answer requests
 */
export class FollowUpAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    const {q, conversationId, accessToken} = input.forwardedProps || {};

    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        q,
        conversationId,
      }),
      signal: this.abortController.signal,
    };
  }
}

export const createFollowUpAgent = (
  agentId: string,
  organizationId: string,
  env: PlatformEnvironment
) =>
  new FollowUpAgent({
    url: `${buildBaseAnswerGenerationUrl(agentId, organizationId, env)}/follow-up`,
  });
