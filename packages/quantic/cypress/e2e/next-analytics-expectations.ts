import {Qna, CaseAssist, ItemClick} from '@coveo/relay-event-types';
import {Interception} from 'cypress/types/net-stubbing';
import {InterceptAliases} from '../page-objects/search';

interface EventMetadata {
  type: string;
  config: {trackingId: string};
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
        })
        .logDetail('should emit the Qna.CitationHover event');
    },

    emitQnaCitationClick: (
      expectedEvent: Qna.CitationClick,
      expectedTrackingId: string
    ) => {
      cy.wait(InterceptAliases.NextAnalytics.Qna.CitationClick)
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
        })
        .logDetail(
          'should emit the Qna.SubmitFeedback event for the feedback reason submission'
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
            'CaseAssist.SelectFieldClassification'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
        })
        .logDetail('should emit the CaseAssist.DocumentSuggestionClick event');
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
          expect(eventMeta).to.have.property('type', 'CaseAssist.UpdateField');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
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
            'CaseAssist.DocumentSuggestionClick'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
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
            'CaseAssist.DocumentSuggestionFeedback'
          );
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
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
          expect(eventBody).to.have.property(
            'actionCause',
            expectedEvent.actionCause
          );
          expect(eventBody).to.have.property(
            'position',
            expectedEvent.position
          );
          expect(eventBody).to.have.property(
            'searchUid',
            expectedEvent.searchUid
          );
          expect(eventMeta).to.have.property('type', 'ItemClick');
          expect(eventMeta.config).to.have.property(
            'trackingId',
            expectedTrackingId
          );
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
