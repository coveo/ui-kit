import {Interception} from '../../../../../../node_modules/cypress/types/net-stubbing';
import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {
  GeneratedAnswerSelector,
  GeneratedAnswerSelectors,
} from './generated-answer-selectors';

function logGeneratedAnswerEvent(event: string, checkPayload: Function) {
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

    displayToggleGeneratedAnswerButton: (display: boolean) => {
      selector
        .toggleGeneratedAnswerButton()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the generated answer toggle button`);
    },

    displayGeneratedAnswerContent: (display: boolean) => {
      selector
        .generatedAnswerContent()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the generated answer content`);
    },

    displayCitations: (display: boolean) => {
      selector
        .citations()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the source citations`);
    },

    displayCopyToClipboardButton: (display: boolean) => {
      selector
        .copyToClipboardButton()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the copy to clipboard button`);
    },

    likeButtonIsChecked: (selected: boolean) => {
      selector
        .likeButton()
        .should(
          selected ? 'have.class' : 'not.have.class',
          'stateful-button--selected'
        )
        .should(
          selected ? 'not.have.class' : 'have.class',
          'stateful-button--unselected'
        )
        .log(`the like button ${should(selected)} be in a liked state`);
    },

    dislikeButtonIsChecked: (selected: boolean) => {
      selector
        .dislikeButton()
        .should(
          selected ? 'have.class' : 'not.have.class',
          'stateful-button--selected'
        )
        .should(
          selected ? 'not.have.class' : 'have.class',
          'stateful-button--unselected'
        )
        .log(`the dislike button ${should(selected)} be in a disliked state`);
    },

    toggleGeneratedAnswerButtonIsChecked: (checked: boolean) => {
      selector
        .toggleGeneratedAnswerButton()
        .should(checked ? 'have.attr' : 'not.have.attr', 'checked', 'checked')
        .log(
          `the generated answer toggle button ${should(checked)} be checked`
        );
    },

    generatedAnswerFooterRowsIsOnMultiline: (multilineDisplay: boolean) => {
      selector
        .generatedAnswerFooterRow()
        .should(
          multilineDisplay ? 'have.class' : 'not.have.class',
          'slds-grid_vertical'
        )
        .log(
          `the generated answer footer rows ${should(
            multilineDisplay
          )} be displayed on multiple lines with slds-grid_vertical`
        );
    },

    generatedAnswerCollapsed: (collapsible: boolean) => {
      selector
        .generatedAnswer()
        .should(
          collapsible ? 'have.class' : 'not.have.class',
          'generated-answer__answer--collapsed'
        )
        .log(`the generated answer ${should(collapsible)} be collapsed`);
    },

    displayGeneratedAnswerGeneratingMessage: (display: boolean) => {
      selector
        .generatingMessage()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the generating message`);
    },

    displayGeneratedAnswerToggleCollapseButton: (display: boolean) => {
      selector
        .toggleCollapseButton()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the generated answer collapse button`);
    },

    generatedAnswerToggleCollapseButtonContains: (text: string) => {
      selector
        .toggleCollapseButton()
        .contains(text)
        .log(`the generated answer collapse button should contain "${text}"`);
    },

    generatedAnswerContains: (answer: string) => {
      selector
        .generatedAnswer()
        .contains(answer)
        .log(`the generated answer should contain "${answer}"`);
    },

    generatedAnswerIsStreaming: (isStreaming: boolean) => {
      selector
        .generatedAnswer()
        .should(
          isStreaming ? 'have.class' : 'not.have.class',
          'generated-answer__answer--streaming'
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

    sessionStorageContains: (key: string, expectedData: object) => {
      cy.getAllSessionStorage()
        .then((sessionStorage) => {
          const matchingKeys = Object.values(sessionStorage).filter(
            (val) =>
              Object.keys(val).includes(`LSKey[c]${key}`) ||
              Object.keys(val).includes(key)
          );
          const storedData = String(
            matchingKeys?.[0]?.[`LSKey[c]${key}`] ||
              matchingKeys?.[0]?.[key] ||
              '{}'
          );
          expect(JSON.parse(storedData)).eql(expectedData);
        })
        .log(
          `the key ${key} should have the value ${expectedData} in the session storage`
        );
    },

    displayFeedbackModal: (display: boolean) => {
      selector
        .feedbackModal()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the feedback modal`);
    },

    displayRephraseButtons: (display: boolean) => {
      selector
        .rephraseButtons()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the rephrase buttons`);
    },

    displayRephraseLabel: (display: boolean) => {
      selector
        .rephraseLabel()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the rephrase label`);
    },

    displayRephraseButtonWithLabel: (label: string) => {
      selector
        .rephraseButtonByLabel(label)
        .should('exist')
        .log(`should display the rephrase button with the label ${label}`);
    },

    displayDisclaimer: (display: boolean) => {
      selector
        .disclaimer()
        .should(display ? 'exist' : 'not.exist')
        .log(`${should(display)} display the disclaimer`);
    },

    disclaimerContains: (text: string) => {
      selector
        .disclaimer()
        .contains(text)
        .log(`the disclaimer should contain "${text}"`);
    },

    rephraseButtonIsSelected: (name: string, selected: boolean) => {
      selector
        .rephraseButtonByLabel(name)
        .should(
          selected ? 'have.class' : 'not.have.class',
          'radio-button--selected'
        )
        .should(
          selected ? 'not.have.class' : 'have.class',
          'radio-button--unselected'
        )
        .log(`the ${name} rephrase button ${should(selected)} be selected`);
    },

    citationTooltipIsDisplayed: (index: number, displayed: boolean) => {
      selector
        .citationTooltip(index)
        .should(
          displayed ? 'have.class' : 'not.have.class',
          'tooltip__content--visible'
        )
        .log(
          `the tooltip of the citation at index ${index} ${should(
            displayed
          )} be displayed`
        );
    },

    citationTooltipUrlContains: (index: number, url: string) => {
      selector
        .citationTooltipUri(index)
        .then((element) => {
          expect(element.get(0).textContent).to.equal(url);
        })
        .log(
          `the citation tooltip url at the index ${index} should contain the url "${url}"`
        );
    },

    citationTooltipTitleContains: (index: number, title: string) => {
      selector
        .citationTooltipTitle(index)
        .then((element) => {
          expect(element.get(0).textContent).to.equal(title);
        })
        .log(
          `the citation tooltip title at the index ${index} should contain the title "${title}"`
        );
    },

    citationTooltipTextContains: (index: number, text: string) => {
      selector
        .citationTooltipText(index)
        .then((element) => {
          expect(element.get(0).textContent).to.equal(text);
        })
        .log(
          `the citation tooltip text at the index ${index} should contain the text "${text}"`
        );
    },

    searchQueryContainsCorrectRephraseOption: (
      expectedAnswerStyle: string,
      expectedActionCause: string
    ) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const body = interception?.request?.body;
          const answerStyle =
            body?.pipelineRuleParameters?.mlGenerativeQuestionAnswering
              ?.responseFormat?.answerStyle;
          const analyticsSection = body.analytics;

          expect(answerStyle).to.eq(expectedAnswerStyle);
          expect(analyticsSection).to.exist;
          expect(analyticsSection).to.have.property(
            'actionCause',
            expectedActionCause
          );
        })
        .log(
          `the search query should contain the correct ${expectedAnswerStyle} parameter`
        );
    },

    searchQueryContainsCorrectFieldsToIncludeInCitations: (
      expectedFields: string[]
    ) => {
      cy.get<Interception>(InterceptAliases.Search)
        .then((interception) => {
          const fieldsToIncludeInCitations =
            interception?.request?.body?.pipelineRuleParameters
              ?.mlGenerativeQuestionAnswering?.citationsFieldToInclude;
          expect(fieldsToIncludeInCitations).to.eql(expectedFields);
        })
        .log(
          'the search query should contain the correct fields to include in citations parameter'
        );
    },

    logStreamIdInAnalytics(streamId: string, useCase: string) {
      cy.wait(
        useCase === 'search'
          ? InterceptAliases.UA.Load
          : InterceptAliases.UA.SearchboxSubmit
      )
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
      logGeneratedAnswerEvent(
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
      logGeneratedAnswerEvent(
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
      logGeneratedAnswerEvent(
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
      logGeneratedAnswerEvent(
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

    logHoverGeneratedAnswerSource(
      streamId: string,
      citation: {id: string; permanentid: string}
    ) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.GeneratedAnswerSourceHover,
        (analyticsBody: {customData: object; eventType: string}) => {
          const customData = analyticsBody?.customData;
          expect(customData).to.have.property('citationHoverTimeMs');
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
      logGeneratedAnswerEvent(
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
      logGeneratedAnswerEvent(
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

    logShowGeneratedAnswer(streamId: string) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.ShowGeneratedAnswer,
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

    logHideGeneratedAnswer(streamId: string) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.HideGeneratedAnswer,
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

    logRephraseGeneratedAnswer(expectedAnswerStyle: string, streamId: string) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.RephraseGeneratedAnswer,
        (analyticsBody: {customData: object; eventType: string}) => {
          const customData = analyticsBody?.customData;
          expect(customData).to.have.property(
            'generativeQuestionAnsweringId',
            streamId
          );
          expect(customData).to.have.property(
            'rephraseFormat',
            expectedAnswerStyle
          );
        }
      );
    },

    logCopyGeneratedAnswer(streamId: string) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.GeneratedAnswerCopyToClipboard,
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

    logGeneratedAnswerExpand(streamId: string) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.GeneratedAnswerExpand,
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

    logGeneratedAnswerCollapse(streamId: string) {
      logGeneratedAnswerEvent(
        InterceptAliases.UA.GeneratedAnswer.GeneratedAnswerCollapse,
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
