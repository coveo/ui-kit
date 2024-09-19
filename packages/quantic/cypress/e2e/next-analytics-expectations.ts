import {Qna, CaseAssist, ItemClick} from '@coveo/relay-event-types';
import {Interception} from 'cypress/types/net-stubbing';
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

function validateSubmitFeedbackEvent(
  interception: Interception,
  expectedEvent: Qna.SubmitFeedback,
  expectedTrackingId: string
) {
  const eventBody = interception?.request?.body?.[0];
  const eventMeta: EventMetadata = eventBody.meta;

  expect(eventBody.answer).to.deep.equal(expectedEvent.answer);
  expect(eventBody.feedback).to.deep.equal(expectedEvent.feedback);

  expect(eventMeta).to.have.property('type', 'Qna.SubmitFeedback');
  expect(eventMeta.config).to.have.property('trackingId', expectedTrackingId);
}

function nextAnalyticsExpectations() {
  return {
    emitQnaAnswerActionEvent: (
      expectedEvent: Qna.AnswerAction,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.AnswerAction)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody).to.have.property('action', expectedEvent.action);
          expect(eventBody.answer).to.deep.equal(expectedEvent.answer);
          expect(eventMeta).to.have.property('type', 'Qna.AnswerAction');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          `should emit the Qna.AnswerAction event with action "${expectedEvent.action}"`
        );
    },

    emitQnaCitationHover: (
      expectedEvent: Qna.CitationHover,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.CitationHover)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.answer).to.deep.equal(expectedEvent.answer);
          expect(eventBody.citation).to.deep.equal(expectedEvent.citation);
          expect(eventMeta).to.have.property('type', 'Qna.CitationHover');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the Qna.CitationHover event');
    },

    emitQnaCitationClick: (
      expectedEvent: Qna.CitationClick,
      expectedTrackingId: string
    ) => {
      const type: 'Source' | 'InlineLink' = expectedEvent.citation.type;
      cy.wait(InterceptAliases.NextAnalytics.Qna.CitationClick[type])
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.citation).to.deep.equal(expectedEvent.citation);
          expect(eventBody.answer).to.deep.equal(expectedEvent.answer);
          expect(eventMeta).to.have.property('type', 'Qna.CitationClick');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the Qna.CitationClick event');
    },

    emitQnaLikeEvent: (
      expectedEvent: Qna.SubmitFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.SubmitFeedback.Like)
        .then((interception): void => {
          validateSubmitFeedbackEvent(
            interception,
            expectedEvent,
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the Qna.SubmitFeedback event for the like action'
        );
    },

    emitQnaDislikeEvent: (
      expectedEvent: Qna.SubmitFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.SubmitFeedback.Dislike)
        .then((interception): void => {
          validateSubmitFeedbackEvent(
            interception,
            expectedEvent,
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the Qna.SubmitFeedback event for the dislike action'
        );
    },

    emitQnaSubmitFeedbackReasonEvent: (
      expectedEvent: Qna.SubmitFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.SubmitFeedback.ReasonSubmit)
        .then((interception): void => {
          validateSubmitFeedbackEvent(
            interception,
            expectedEvent,
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the Qna.SubmitFeedback event for the feedback reason submission'
        );
    },

    emitQnaSubmitRgaFeedbackEvent: (
      expectedEvent: Qna.SubmitRgaFeedback,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.SubmitRgaFeedback)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;
          expect(eventBody.answer).to.deep.equal(expectedEvent.answer);
          expect(eventBody.feedback).to.deep.equal(expectedEvent.feedback);

          expect(eventMeta).to.have.property('type', 'Qna.SubmitRgaFeedback');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the Qna.SubmitRgaFeedback event for submitting rga feedback'
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

          expect(eventBody.fieldClassification).to.deep.equal(
            expectedEvent.fieldClassification
          );
          expect(eventBody).to.have.property(
            'autoselected',
            expectedEvent.autoselected
          );
          expect(eventMeta).to.have.property(
            'type',
            'caseAssist.selectFieldClassification'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the caseAssist.selectFieldClassification');
    },

    emitUpdateField: (
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
          expect(eventMeta).to.have.property('type', 'caseAssist.updateField');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail('should emit the CaseAssist.DocumentSuggestionClick event');
    },

    emitCaseAssistDocumentSuggestionClick: (
      expectedEvent: CaseAssist.DocumentSuggestionClick,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.CaseAssist.DocumentSuggestionClick)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.documentSuggestion).to.deep.equal(
            expectedEvent.documentSuggestion
          );
          expect(eventMeta).to.have.property(
            'type',
            'caseAssist.documentSuggestionClick'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

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

          expect(eventBody.documentSuggestion).to.deep.equal(
            expectedEvent.documentSuggestion
          );
          expect(eventBody).to.have.property('liked', expectedEvent.liked);
          expect(eventMeta).to.have.property(
            'type',
            'caseAssist.documentSuggestionFeedback'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the CaseAssist.DocumentSuggestionFeedback event'
        );
    },

    emitItemClick: (expectedEvent: ItemClick, expectedTrackingId: string) => {
      cy.wait(InterceptAliases.NextAnalytics.ItemClick)
        .then((interception): void => {
          const eventBody = interception?.request?.body?.[0];
          const eventMeta: EventMetadata = eventBody.meta;

          expect(eventBody.itemMetadata).to.deep.equal(
            expectedEvent.itemMetadata
          );
          if (expectedEvent.actionCause) {
            expect(eventBody).to.have.property(
              'actionCause',
              expectedEvent.actionCause
            );
          }
          expect(eventBody).to.have.property(
            'position',
            expectedEvent.position
          );
          expect(eventBody).to.have.property(
            'searchUid',
            expectedEvent.searchUid
          );
          expect(eventMeta).to.have.property('type', 'itemClick');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );

          validateEventWithEventAPI(interception.request);
        })
        .logDetail(
          'should emit the CaseAssist.DocumentSuggestionFeedback event'
        );
    },
  };
}

export const NextAnalyticsExpectations = {
  ...nextAnalyticsExpectations(),
};
