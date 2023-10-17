import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
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
        .log(`${should(display)} display the generated answer card`);
    },

    displayLikeButton: (display: boolean) => {
      selector
        .likeButton()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the like button`);
    },

    displayDislikeButton: (display: boolean) => {
      selector
        .dislikeButton()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the dislike button`);
    },

    displayCitations: (display: boolean) => {
      selector
        .citations()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the source citations`);
    },

    likeButtonIsChecked: (checked: boolean) => {
      selector
        .likeButton()
        .should(
          checked ? 'have.class' : 'not.have.class',
          'feedback__button--liked'
        )
        .log(`the like button ${should(checked)} be in a liked state`);
    },

    dislikeButtonIsChecked: (checked: boolean) => {
      selector
        .dislikeButton()
        .should(
          checked ? 'have.class' : 'not.have.class',
          'feedback__button--disliked'
        )
        .log(`the dislike button ${should(checked)} be in a disliked state`);
    },

    generatedAnswerContains: (answer: string) => {
      selector
        .generatedAnswerContent()
        .contains(answer)
        .log(`the generated answer should contain "${answer}"`);
    },

    generatedAnswerIsStreaming: (isStreaming: boolean) => {
      selector
        .generatedAnswerContent()
        .should(
          isStreaming ? 'have.class' : 'not.have.class',
          'generated-answer__content--streaming'
        )
        .log(`the generated answer ${should(isStreaming)} be streaming`);
    },

    citationTitleContains: (index: number, title: string) => {
      selector
        .citationTitle(index)
        .then((element) => {
          expect(element.get(0).innerText).to.equal(title);
        })
        .log(
          `the citation at the index ${index} should contain the title "${title}"`
        );
    },

    citationNumberContains: (index: number, value: string) => {
      selector
        .citationIndex(index)
        .then((element) => {
          expect(element.get(0).innerText).to.equal(value);
        })
        .log(
          `the citation at the index ${index} should contain the number "${value}"`
        );
    },

    citationLinkContains: (index: number, value: string) => {
      selector
        .citationLink(index)
        .then((element) => {
          expect(element.get(0).getAttribute('href')).to.equal(value);
        })
        .log(
          `the citation ar the index ${index} should contain link "${value}"`
        );
    },

    displayFeedbackModal: (display: boolean) => {
      selector
        .feedbackModal()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the feedback modal`);
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

    logOpenGeneratedAnswerSource(
      streamId: string,
      citation: {id: string; permanentid: string}
    ) {
      logCustomGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.OpenGeneratedAnswerSource,
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
          expect(customData).to.have.property('citationId', citation.id);
          expect(customData).to.have.property(
            'permanentId',
            citation.permanentid
          );
        }
      );
    },

    logRetryGeneratedAnswer(streamId: string) {
      logCustomGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.RetryGeneratedAnswer,
        (analyticsBody: {customData: object; eventType: string}) => {
          const customData = analyticsBody?.customData;
          expect(customData).to.have.property(
            'generativeQuestionAnsweringId',
            streamId
          );
        }
      );
    },

    logGeneratedAnswerFeedbackSubmit(
      streamId: string,
      payload: {
        reason: string;
        details?: string;
      }
    ) {
      logCustomGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.GeneratedAnswerFeedbackSubmit,
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
          expect(customData).to.have.property('reason', payload.reason);
          if (payload.details) {
            expect(customData).to.have.property('details', payload.details);
          }
        }
      );
    },
  };
}

export const GeneratedAnswerExpectations = {
  ...generatedAnswerExpectations(GeneratedAnswerSelectors),
};
