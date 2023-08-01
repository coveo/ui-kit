import {InterceptAliases} from '../../../page-objects/search';
import {
  GeneratedAnswerSelector,
  GeneratedAnswerSelectors,
} from './generated-answer-selectors';

function logCustomGeneratedAnswerEvent(event: string, checkPayload: Function) {
  cy.wait(event)
    .then((interception) => {
      const analyticsBody = interception.request.body;
      checkPayload(analyticsBody);
    })
    .logDetail(`should log the '${event}' UA event`);
}

function generatedAnswerExpectations(selector: GeneratedAnswerSelector) {
  return {
    displayGeneratedAnswerCard: (display: boolean) => {
      selector
        .generatedAnswerCard()
        .should(display ? 'exist' : 'not.exist')
        .log('should display the generated answer card');
    },

    displayLikeButton: (display: boolean) => {
      selector
        .likeButton()
        .should(display ? 'exist' : 'not.exist')
        .log('should display the like button');
    },

    displayDislikeButton: (display: boolean) => {
      selector
        .dislikeButton()
        .should(display ? 'exist' : 'not.exist')
        .log('should display the dislike button');
    },

    likeButtonIsChecked: (checked: boolean) => {
      selector
        .likeButton()
        .should(
          checked ? 'have.class' : 'not.have.class',
          'feedback__button--liked'
        )
        .log('should display the dislike button');
    },

    dislikeButtonIsChecked: (checked: boolean) => {
      selector
        .dislikeButton()
        .should(
          checked ? 'have.class' : 'not.have.class',
          'feedback__button--disliked'
        )
        .log('should display the dislike button');
    },

    generatedAnswerContains: (answer: string) => {
      selector
        .generatedAnswer()
        .contains(answer)
        .log(`the generated answer should contain "${answer}"`);
    },

    logStreamIdInAnalytics(streamId: string) {
      cy.wait(InterceptAliases.UA.Load)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          const customData = analyticsBody?.customData;
          expect(customData).to.have.property(
            'generativeQuestionAnsweringId',
            streamId
          );
        })
        .logDetail('should log the stream id in the UA event custom data');
    },

    logLikeGeneratedAnswer(streamId: string) {
      logCustomGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.LikeGeneratedAnswer,
        (analyticsBody: {customData: object; eventType: string}) => {
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property(
            'eventType',
            'generatedAnswer'
          );
          expect(customData).to.have.property(
            'generativeQuestionAnsweringId',
            streamId
          );
        }
      );
    },

    logDislikeGeneratedAnswer(streamId: string) {
      logCustomGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.DislikeGeneratedAnswer,
        (analyticsBody: {customData: object; eventType: string}) => {
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property(
            'eventType',
            'generatedAnswer'
          );
          expect(customData).to.have.property(
            'generativeQuestionAnsweringId',
            streamId
          );
        }
      );
    },

    logGeneratedAnswerStreamEnd(streamId: string) {
      logCustomGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.GeneratedAnswerStreamEnd,
        (analyticsBody: {customData: object; eventType: string}) => {
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property(
            'eventType',
            'generatedAnswer'
          );
          expect(customData).to.have.property(
            'generativeQuestionAnsweringId',
            streamId
          );
        }
      );
    },
  };
}

export const GeneratedAnswerExpectations = {
  ...generatedAnswerExpectations(GeneratedAnswerSelectors),
};
