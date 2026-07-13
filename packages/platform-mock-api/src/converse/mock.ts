import {type HttpHandler, http} from 'msw';
import type {MockApi} from '../_base.js';
import {
  baseResponse,
  buildConverseStreamingResponse,
  matchPrompt,
  type TemplateId,
} from './generate-response.js';
import {buildStreamingResponse, type ConverseEvent} from './events.js';

export class MockConverseApi implements MockApi {
  private converseHandler: HttpHandler;
  private nextResponses: (() => ReturnType<typeof baseResponse>)[] = [];

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.converseHandler = http.post(
      `${basePath}/rest/organizations/:orgId/commerce/unstable/agentic/converse`,
      async ({request}) => {
        if (this.nextResponses.length > 0) {
          const nextResponse = this.nextResponses.shift()!;
          return nextResponse();
        }

        const body = await request.json().catch(() => ({}));
        return baseResponse(body);
      }
    );
  }

  get handlers(): HttpHandler[] {
    return [this.converseHandler];
  }

  mockOnce(templateId: TemplateId) {
    this.nextResponses.push(() =>
      buildConverseStreamingResponse({
        delayBetweenMessages: 'real',
        templateId,
      })
    );
  }

  mockOnceWithEvents(events: ConverseEvent[]) {
    this.nextResponses.push(() =>
      buildStreamingResponse(events, {delayBetweenMessages: 'real'})
    );
  }

  mockWithPrompt(message: string) {
    const templateId = matchPrompt(message);
    this.mockOnce(templateId);
  }

  clearAll(): void {
    this.nextResponses.length = 0;
  }
}
