import {InterceptAliases} from '../page-objects/search';

function nextAnalyticsExpectations() {
  return {
    emitQnaAnswerActionEvent: (action: string) => {
      cy.wait(InterceptAliases.NextAnalytics.QNA.AnswerAction)
        .then((interception): void => {
          const eventBody: Record<string, unknown> =
            interception?.request?.body?.[0];
          const eventMeta = eventBody.meta;
          expect(eventBody).to.have.property('action', action);
          expect(eventMeta).to.have.property('type', 'Qna.AnswerAction');
        })
        .logDetail(
          `should emit the Qna.AnswerStyle event with action "${action}"`
        );
    },
  };
}

export const NextAnalyticsExpectations = {
  ...nextAnalyticsExpectations(),
};
