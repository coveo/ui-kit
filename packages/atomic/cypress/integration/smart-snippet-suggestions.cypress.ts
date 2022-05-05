import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {
  smartSnippetSuggestionsComponent,
  SmartSnippetSuggestionsSelectors,
} from './smart-snippet-suggestions-selectors';
import * as SmartSnippetSuggestionsAssertions from './smart-snippet-suggestions-assertions';
import * as CommonAssertions from './common-assertions';
import {addSearchBox} from './search-box-actions';
import {SearchBoxSelectors} from './search-box-selectors';
import {
  addSmartSnippetSuggestions,
  addSmartSnippetSuggestionsDefaultOptions,
} from './smart-snippet-suggestions-actions';

const {remSize, relatedQuestions: defaultRelatedQuestions} =
  addSmartSnippetSuggestionsDefaultOptions;

function buildAnswerWithHeight(height: number) {
  const heightWithoutMargins = height - remSize * 2;
  return `<div style="height: ${heightWithoutMargins}px; background-color: red;"></div>`;
}

describe('Smart Snippet Suggestions Test Suites', () => {
  describe('after toggling the first section twice and all others once', () => {
    const expectedNumberOfCollapsedSections = 1;
    const expectedNumberOfExpandedSections =
      defaultRelatedQuestions.length - expectedNumberOfCollapsedSections;
    before(() => {
      new TestFixture().with(addSmartSnippetSuggestions()).init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton().each((e) =>
        cy.wrap(e).click()
      );
      SmartSnippetSuggestionsSelectors.questionExpandedButton().first().click();
    });

    it('should render the correct expanded/collapsed parts', () => {
      SmartSnippetSuggestionsSelectors.questionAnswerExpanded()
        .its('length')
        .should('eq', expectedNumberOfExpandedSections);
      SmartSnippetSuggestionsSelectors.questionExpandedButton()
        .its('length')
        .should('eq', expectedNumberOfExpandedSections);
      SmartSnippetSuggestionsSelectors.questionExpandedIcon()
        .its('length')
        .should('eq', expectedNumberOfExpandedSections);
      SmartSnippetSuggestionsSelectors.questionExpandedText()
        .its('length')
        .should('eq', expectedNumberOfExpandedSections);
      SmartSnippetSuggestionsSelectors.answerAndSource()
        .its('length')
        .should('eq', expectedNumberOfExpandedSections);

      SmartSnippetSuggestionsSelectors.questionAnswerCollapsed()
        .its('length')
        .should('eq', expectedNumberOfCollapsedSections);
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .its('length')
        .should('eq', expectedNumberOfCollapsedSections);
      SmartSnippetSuggestionsSelectors.questionCollapsedIcon()
        .its('length')
        .should('eq', expectedNumberOfCollapsedSections);
      SmartSnippetSuggestionsSelectors.questionCollapsedText()
        .its('length')
        .should('eq', expectedNumberOfCollapsedSections);
    });

    CommonAssertions.assertAccessibility(smartSnippetSuggestionsComponent);
  });

  describe('with no heading level and no expanded section', () => {
    before(() => {
      new TestFixture().with(addSmartSnippetSuggestions()).init();
    });

    it('should fallback to a div for the accessibility heading', () => {
      SmartSnippetSuggestionsSelectors.heading().should(
        'have.prop',
        'tagName',
        'DIV'
      );
    });

    it('should fallback to a div for questions', () => {
      SmartSnippetSuggestionsSelectors.questionCollapsedText()
        .first()
        .should('have.prop', 'tagName', 'DIV');
    });

    it('render the correct questions', () => {
      SmartSnippetSuggestionsSelectors.questionCollapsedText()
        .map((el) => el.text())
        .should(
          'deep.equal',
          defaultRelatedQuestions.map(
            (relatedQuestion) => relatedQuestion.question
          )
        );
    });
  });

  describe('with a specific heading level and no expanded section', () => {
    const headingLevel = 5;
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({props: {'heading-level': headingLevel}})
        )
        .init();
    });

    it('should use the correct heading level for the accessibility heading', () => {
      SmartSnippetSuggestionsSelectors.heading().should(
        'have.prop',
        'tagName',
        'H' + headingLevel
      );
    });

    it('should use the correct heading level for the question', () => {
      SmartSnippetSuggestionsSelectors.questionCollapsedText()
        .first()
        .should('have.prop', 'tagName', 'H' + (headingLevel + 1));
    });
  });

  describe('with all sections expanded', () => {
    before(() => {
      new TestFixture().with(addSmartSnippetSuggestions()).init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton().each((e) =>
        cy.wrap(e).click()
      );
    });

    it('should have links to the source', () => {
      SmartSnippetSuggestionsSelectors.sourceUrl()
        .map((el) => el.attr('href'))
        .should(
          'deep.equal',
          defaultRelatedQuestions.map(
            (relatedQuestion) => relatedQuestion.sourceUrl
          )
        );
      SmartSnippetSuggestionsSelectors.sourceUrl()
        .map((el) => el.text())
        .should(
          'deep.equal',
          defaultRelatedQuestions.map(
            (relatedQuestion) => relatedQuestion.sourceUrl
          )
        );
      SmartSnippetSuggestionsSelectors.sourceTitle()
        .map((el) => el.attr('href'))
        .should(
          'deep.equal',
          defaultRelatedQuestions.map(
            (relatedQuestion) => relatedQuestion.sourceUrl
          )
        );
      SmartSnippetSuggestionsSelectors.sourceTitle()
        .map((el) => el.text())
        .should(
          'deep.equal',
          defaultRelatedQuestions.map(
            (relatedQuestion) => relatedQuestion.sourceTitle
          )
        );
    });
  });

  describe('when maximumHeight is smaller than collapsedHeight', () => {
    before(() => {
      const value = 50;
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            props: {
              'maximum-height': value - 1,
              'collapsed-height': value,
            },
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    CommonAssertions.assertConsoleError(true);
    CommonAssertions.assertContainsComponentError(
      SmartSnippetSuggestionsSelectors,
      true
    );
  });

  describe("when an expanded snippet's height is equal to maximumHeight", () => {
    before(() => {
      const height = 300;
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: [
              {
                ...defaultRelatedQuestions[0],
                answer: buildAnswerWithHeight(height),
              },
            ],
            props: {
              'maximum-height': height,
              'collapsed-height': 150,
            },
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertShowMore(false);
    SmartSnippetSuggestionsAssertions.assertShowLess(false);
  });

  describe("when an expanded snippet's height is greater than maximumHeight", () => {
    const height = 300;
    const heightWhenCollapsed = 150;
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: [
              {
                ...defaultRelatedQuestions[0],
                answer: buildAnswerWithHeight(height),
              },
            ],
            props: {
              'maximum-height': height - 1,
              'collapsed-height': heightWhenCollapsed,
            },
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertShowMore(true);
    SmartSnippetSuggestionsAssertions.assertShowLess(false);
    SmartSnippetSuggestionsAssertions.assertAnswerHeight(heightWhenCollapsed);

    describe('then pressing show more', () => {
      before(() => {
        SmartSnippetSuggestionsSelectors.showMoreButton().click();
      });

      SmartSnippetSuggestionsAssertions.assertShowMore(false);
      SmartSnippetSuggestionsAssertions.assertShowLess(true);
      SmartSnippetSuggestionsAssertions.assertAnswerHeight(height);

      describe('then pressing show less', () => {
        before(() => {
          SmartSnippetSuggestionsSelectors.showLessButton().click();
        });

        SmartSnippetSuggestionsAssertions.assertShowMore(true);
        SmartSnippetSuggestionsAssertions.assertShowLess(false);
        SmartSnippetSuggestionsAssertions.assertAnswerHeight(
          heightWhenCollapsed
        );
      });
    });
  });

  describe('when the snippet starts and ends with text nodes', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                answer: 'Abc<p>def</p>ghi',
              })
            ),
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertAnswerTopMargin(remSize / 2);
    SmartSnippetSuggestionsAssertions.assertAnswerBottomMargin(remSize);
  });

  describe('when the snippet contains elements with margins', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                answer:
                  '<p>Paragraph A</p><p>Paragraph B</p><p>Paragraph C</p>',
              })
            ),
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertAnswerTopMargin(remSize / 2);
    SmartSnippetSuggestionsAssertions.assertAnswerBottomMargin(remSize);
  });

  describe('when the snippet contains collapsing margins', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                answer:
                  '<span><p>My parent has no margins, but I do!</p></span>',
              })
            ),
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertAnswerTopMargin(remSize / 2);
    SmartSnippetSuggestionsAssertions.assertAnswerBottomMargin(remSize);
  });

  describe('after clicking on the title', () => {
    let currentQuestion: string | undefined = undefined;
    beforeEach(() => {
      currentQuestion = undefined;
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                get question() {
                  return currentQuestion ?? relatedQuestion.question;
                },
              })
            ),
          })
        )
        .with(addSearchBox())
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
      SmartSnippetSuggestionsSelectors.sourceTitle().first().rightclick();
    });

    SmartSnippetSuggestionsAssertions.assertlogOpenSmartSnippetSuggestionsSource(
      true
    );

    describe('then getting a new snippet and clicking on the title again', () => {
      beforeEach(() => {
        currentQuestion = 'Hello, World!';
        SearchBoxSelectors.submitButton().click();
        SmartSnippetSuggestionsSelectors.sourceTitle().first().rightclick();
      });

      SmartSnippetSuggestionsAssertions.assertlogOpenSmartSnippetSuggestionsSource(
        true
      );
    });
  });

  describe('with custom styling in a template element', () => {
    before(() => {
      const styleEl = generateComponentHTML('style');
      styleEl.innerHTML = `
        b {
          color: rgb(84, 170, 255);
        }
      `;
      const templateEl = generateComponentHTML(
        'template'
      ) as HTMLTemplateElement;
      templateEl.content.appendChild(styleEl);
      new TestFixture()
        .with(addSmartSnippetSuggestions({content: templateEl}))
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    it('applies the styling to the rendered snippet', () => {
      SmartSnippetSuggestionsSelectors.answer()
        .first()
        .find('b')
        .invoke('css', 'color')
        .should('equal', 'rgb(84, 170, 255)');
    });
  });

  describe('with custom styling in an attribute', () => {
    before(() => {
      const style = `
        b {
          color: rgb(84, 170, 255);
        }
      `;
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            props: {'snippet-style': style},
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    it('applies the styling to the rendered snippet', () => {
      SmartSnippetSuggestionsSelectors.answer()
        .first()
        .find('b')
        .invoke('css', 'color')
        .should('equal', 'rgb(84, 170, 255)');
    });
  });

  describe('when expanding a truncated answer (analytics)', () => {
    const height = 300;
    const heightWhenCollapsed = 150;
    beforeEach(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: [
              {
                ...defaultRelatedQuestions[0],
                answer: buildAnswerWithHeight(height),
              },
            ],
            props: {
              'maximum-height': height - 1,
              'collapsed-height': heightWhenCollapsed,
            },
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    describe('then pressing show more', () => {
      beforeEach(() => {
        SmartSnippetSuggestionsSelectors.showMoreButton().click();
      });

      SmartSnippetSuggestionsAssertions.assertLogShowMoreSmartSnippetSuggestion();

      describe('then pressing show less', () => {
        beforeEach(() => {
          SmartSnippetSuggestionsSelectors.showLessButton().click();
        });

        SmartSnippetSuggestionsAssertions.assertLogShowLessSmartSnippetSuggestion();
      });
    });
  });
});
