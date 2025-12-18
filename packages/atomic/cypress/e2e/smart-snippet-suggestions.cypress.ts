import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {
  addSmartSnippetSuggestions,
  addSmartSnippetSuggestionsDefaultOptions,
} from './smart-snippet-suggestions-actions';
import * as SmartSnippetSuggestionsAssertions from './smart-snippet-suggestions-assertions';
import {
  smartSnippetSuggestionsComponent,
  SmartSnippetSuggestionsSelectors,
} from './smart-snippet-suggestions-selectors';

const {remSize, relatedQuestions: defaultRelatedQuestions} =
  addSmartSnippetSuggestionsDefaultOptions;

describe('Smart Snippet Suggestions Test Suites', () => {
  describe('after toggling the first section twice and all others once', () => {
    const expectedNumberOfCollapsedSections = 1;
    const expectedNumberOfExpandedSections =
      defaultRelatedQuestions.length - expectedNumberOfCollapsedSections;
    beforeEach(() => {
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
    beforeEach(() => {
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

  describe('with no heading level and all expanded sections', () => {
    beforeEach(() => {
      new TestFixture().with(addSmartSnippetSuggestions()).init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton().each(
        ($element) => cy.wrap($element).click()
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
        .map((el) =>
          el
            .find('atomic-text')
            .get(0)
            .shadowRoot?.textContent
        )
        .should(
          'deep.equal',
          defaultRelatedQuestions.map(
            (relatedQuestion) => relatedQuestion.sourceTitle
          )
        );
    });
  });

  describe('with a specific heading level and no expanded section', () => {
    const headingLevel = 5;
    beforeEach(() => {
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

  describe('when the snippet starts and ends with text nodes', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                answer:
                  '<span class="first">Abc</span><p>def</p><span class="last">ghi</span>',
              })
            ),
            props: {'snippet-style': 'span { display: block; }'},
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertAnswerTopMargin(
      remSize / 2,
      'first'
    );
    SmartSnippetSuggestionsAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('when the snippet contains elements with margins', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                answer:
                  '<p class="first">Paragraph A</p><p>Paragraph B</p><p class="last">Paragraph C</p>',
              })
            ),
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertAnswerTopMargin(
      remSize / 2,
      'first'
    );
    SmartSnippetSuggestionsAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('when the snippet contains collapsing margins', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addSmartSnippetSuggestions({
            relatedQuestions: defaultRelatedQuestions.map(
              (relatedQuestion) => ({
                ...relatedQuestion,
                answer:
                  '<span><p class="first last">My parent has no margins, but I do!</p></span>',
              })
            ),
          })
        )
        .init();
      SmartSnippetSuggestionsSelectors.questionCollapsedButton()
        .first()
        .click();
    });

    SmartSnippetSuggestionsAssertions.assertAnswerTopMargin(
      remSize / 2,
      'first'
    );
    SmartSnippetSuggestionsAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  

  

  describe('with custom styling in a template element', () => {
    beforeEach(() => {
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
    beforeEach(() => {
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
});
