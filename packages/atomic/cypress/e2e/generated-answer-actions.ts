import {RouteAlias} from '../fixtures/fixture-common';
import {TestFixture, generateComponentHTML} from '../fixtures/test-fixture';

export const getStreamInterceptAlias = (streamId: string) =>
  `${RouteAlias.GenQAStream}-${streamId}`;

export function mockStreamResponse(streamId: string, body: unknown) {
  cy.intercept(
    {
      method: 'GET',
      url: `**/machinelearning/streaming/${streamId}`,
    },
    (request) => {
      request.reply(200, `data: ${JSON.stringify(body)} \n\n`, {
        'content-type': 'text/event-stream',
      });
    }
  ).as(getStreamInterceptAlias(streamId).substring(1));
}

export function mockStreamError(streamId: string, errorCode: number) {
  cy.intercept(
    {
      method: 'GET',
      url: `**/machinelearning/streaming/${streamId}`,
    },
    (request) => {
      request.reply(
        errorCode,
        {},
        {
          'content-type': 'text/event-stream',
        }
      );
    }
  ).as(getStreamInterceptAlias(streamId).substring(1));
}

export const addGeneratedAnswer =
  (streamId?: string) => (fixture: TestFixture) => {
    const element = generateComponentHTML('atomic-generated-answer');
    fixture.withElement(element).withCustomResponse((response) => {
      if (streamId) {
        response.extendedResults = {
          generativeQuestionAnsweringId: streamId,
        };
      }
    });
  };
