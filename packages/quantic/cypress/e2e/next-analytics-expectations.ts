import {Qna} from '@coveo/relay-event-types';
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

    emitQnaSubmitNegativeFeedbackEvent: (
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
  };
}

export const NextAnalyticsExpectations = {
  ...nextAnalyticsExpectations(),
};
