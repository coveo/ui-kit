import {SmartSnippets, CaseAssist, Rga} from '@coveo/relay-event-types';
import {InterceptAliases} from '../page-objects/search';

interface EventMetadata {
  type: string;
  config: {trackingId: string};
}

async function validateEventWithEventAPI(request: {
  url: string;
  body: unknown;
}) {
  const validateUrl = request.url.replace('/v1', '/v1/validate');
  const response = await fetch(validateUrl, {
    method: 'post',
    body: JSON.stringify(request.body),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const parsedResponse = (await response.json())[0];

  parsedResponse?.errors?.forEach(
    (error: {message: string; type: string; path: string}) => {
      Cypress.log({
        name: 'Event protocol validation',
        displayName: '❌❌❌ EP validation ❌❌❌',
        message: error.message,
        consoleProps: () => error,
      });
    }
  );
  expect(parsedResponse).to.have.property('valid', true);
}

function nextAnalyticsExpectations() {
  return {
    emitSmartSnippetsSourceClick: (
      expectedEvent: SmartSnippets.SourceClick,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.SmartSnippets.SourceClick)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'responseId',
            expectedEvent.responseId
          );
          expect(eventBody).to.have.property(
            'snippetType',
            expectedEvent.snippetType
          );
          expect(eventMeta).to.have.property(
            'type',
            'SmartSnippets.SourceClick'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the SmartSnippets.SourceClick event');
    },

    emitSmartSnippetsAnswerAction: (
      expectedEvent: SmartSnippets.AnswerAction,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.SmartSnippets.AnswerAction)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'responseId',
            expectedEvent.responseId
          );
          expect(eventBody).to.have.property(
            'snippetType',
            expectedEvent.snippetType
          );
          expect(eventBody).to.have.property('action', expectedEvent.action);
          expect(eventMeta).to.have.property(
            'type',
            'SmartSnippets.AnswerAction'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          `should emit the SmartSnippets.AnswerAction event with action "${expectedEvent.action}"`
        );
    },

    emitSmartSnippetsSubmitFeedback: (
      expectedEvent: SmartSnippets.SubmitFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.SmartSnippets.SubmitFeedback)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'responseId',
            expectedEvent.responseId
          );
          expect(eventBody).to.have.property(
            'snippetType',
            expectedEvent.snippetType
          );
          expect(eventBody).to.have.property('reason', expectedEvent.reason);
          if (expectedEvent.additionalNotes) {
            expect(eventBody).to.have.property(
              'additionalNotes',
              expectedEvent.additionalNotes
            );
          }
          expect(eventMeta).to.have.property(
            'type',
            'SmartSnippets.SubmitFeedback'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the SmartSnippets.SubmitFeedback event with action'
        );
    },

    emitRgaAnswerAction: (
      expectedEvent: Rga.AnswerAction,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Rga.AnswerAction)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody).to.have.property(
            'answerId',
            expectedEvent.answerId
          );
          expect(eventBody).to.have.property('action', expectedEvent.action);
          expect(eventMeta).to.have.property('type', 'Rga.AnswerAction');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          eventBody.meta.ts = Date.now();
          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          `should emit the Rga.AnswerAction event with action "${expectedEvent.action}"`
        );
    },

    emitRgaAnswerReceived: (
      expectedEvent: Rga.AnswerReceived,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Rga.AnswerReceived)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody).to.have.property(
            'answerId',
            expectedEvent.answerId
          );
          expect(eventBody).to.have.property(
            'answerGenerated',
            expectedEvent.answerGenerated
          );
          expect(eventMeta).to.have.property('type', 'Rga.AnswerReceived');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          eventBody.meta.ts = Date.now();
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the Rga.AnswerReceived event');
    },

    emitRgaSubmitFeedback: (
      expectedEvent: Rga.SubmitFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Rga.SubmitFeedback)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.details).to.deep.equal(expectedEvent.details);
          expect(eventBody).to.have.property('helpful', expectedEvent.helpful);
          expect(eventBody).to.have.property(
            'answerId',
            expectedEvent.answerId
          );
          if (expectedEvent.additionalNotes) {
            expect(eventBody).to.have.property(
              'additionalNotes',
              expectedEvent.additionalNotes
            );
          }
          if (expectedEvent.correctAnswerUrl) {
            expect(eventBody).to.have.property(
              'correctAnswerUrl',
              expectedEvent.correctAnswerUrl
            );
          }
          expect(eventMeta).to.have.property('type', 'Rga.SubmitFeedback');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the Rga.SubmitFeedback event for submitting rga feedback'
        );
    },

    emitRgaCitationHover: (
      expectedEvent: Omit<Rga.CitationHover, 'citationHoverTimeInMs'>,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Rga.CitationHover)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'answerId',
            expectedEvent.answerId
          );
          expect(eventBody).to.have.property(
            'citationId',
            expectedEvent.citationId
          );
          expect(eventBody).to.have.property('citationHoverTimeInMs');
          expect(eventMeta).to.have.property('type', 'Rga.CitationHover');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          eventBody.meta.ts = Date.now();
          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the Rga.CitationHover event');
    },

    emitRgaCitationClick: (
      expectedEvent: Rga.CitationClick,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Rga.CitationClick)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'answerId',
            expectedEvent.answerId
          );
          expect(eventBody).to.have.property(
            'citationId',
            expectedEvent.citationId
          );
          expect(eventMeta).to.have.property('type', 'Rga.CitationClick');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          eventBody.meta.ts = Date.now();
          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the Rga.CitationClick event');
    },

    emitCaseAssistDocumentSuggestionClick: (
      expectedEvent: CaseAssist.DocumentSuggestionClick,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.CaseAssist.DocumentSuggestionClick)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'position',
            expectedEvent.position
          );
          expect(eventBody).to.have.property(
            'responseId',
            expectedEvent.responseId
          );
          expect(eventMeta).to.have.property(
            'type',
            'CaseAssist.DocumentSuggestionClick'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the CaseAssist.DocumentSuggestionClick event');
    },

    emitCaseAssistDocumentSuggestionFeedback: (
      expectedEvent: CaseAssist.DocumentSuggestionFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(
        InterceptAliases.NextAnalytics.CaseAssist.DocumentSuggestionFeedback
      )
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          expect(eventBody).to.have.property(
            'responseId',
            expectedEvent.responseId
          );
          expect(eventBody).to.have.property('liked', expectedEvent.liked);
          expect(eventMeta).to.have.property(
            'type',
            'CaseAssist.DocumentSuggestionFeedback'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          // Updating the URL to a valid one, as '#' is used in the tests to simplify link testing
          eventBody.itemMetadata.url = 'https://www.coveo.com/';
          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the CaseAssist.DocumentSuggestionFeedback event'
        );
    },

    emitCaseAssistSelectFieldClassification: (
      expectedEvent: CaseAssist.SelectFieldClassification,
      expectedTrackingId: string
    ) => {
      cy.wait(
        InterceptAliases.NextAnalytics.CaseAssist.SelectFieldClassification
      )
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody).to.have.property(
            'classificationId',
            expectedEvent.classificationId
          );
          expect(eventBody).to.have.property(
            'responseId',
            expectedEvent.responseId
          );
          expect(eventBody).to.have.property(
            'autoselected',
            expectedEvent.autoselected
          );
          expect(eventMeta).to.have.property(
            'type',
            'CaseAssist.SelectFieldClassification'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the CaseAssist.SelectFieldClassification');
    },

    emitCaseAssistUpdateField: (
      expectedEvent: CaseAssist.UpdateField,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.CaseAssist.UpdateField)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;
          expect(eventBody).to.have.property(
            'fieldName',
            expectedEvent.fieldName
          );
          expect(eventBody).to.have.property(
            'fieldValue',
            expectedEvent.fieldValue
          );
          expect(eventMeta).to.have.property('type', 'CaseAssist.UpdateField');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the CaseAssist.UpdateField event');
    },
  };
}

export const NextAnalyticsExpectations = {
  ...nextAnalyticsExpectations(),
};
