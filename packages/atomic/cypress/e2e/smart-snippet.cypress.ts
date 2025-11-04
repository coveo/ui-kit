import {InlineLink} from '@coveo/headless';
import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import * as CommonAssertions from './common-assertions';
import {addSearchBox} from './search-box/search-box-actions';
import {SearchBoxSelectors} from './search-box/search-box-selectors';
import {
  addSmartSnippet,
  addSmartSnippetDefaultOptions,
  AddSmartSnippetMockSnippet,
  defaultSnippets,
} from './smart-snippet-actions';
import * as SmartSnippetAssertions from './smart-snippet-assertions';
import {
  smartSnippetComponent,
  SmartSnippetSelectors,
} from './smart-snippet-selectors';

const {remSize, snippet: defaultSnippet} = addSmartSnippetDefaultOptions;

const {
  question: defaultQuestion,
  sourceTitle: defaultSourceTitle,
  sourceUrl: defaultSourceUrl,
} = defaultSnippet;

function buildAnswerWithHeight(height: number) {
  const heightWithoutMargins = height - remSize * 2;
  return `<div style="height: ${heightWithoutMargins}px; background-color: red;"></div>`;
}

describe('Smart Snippet Test Suites', () => {
  it('should work correctly with no heading level', () => {
    new TestFixture().with(addSmartSnippet()).init();

    cy.log('should fallback to a div for the accessibility heading');
    SmartSnippetSelectors.accessibilityHeading().should(
      'have.prop',
      'tagName',
      'DIV'
    );
    cy.log('should fallback to a div for the question');
    SmartSnippetSelectors.question().should('have.prop', 'tagName', 'DIV');
    cy.log('render the correct question');
    SmartSnippetSelectors.question().should('have.text', defaultQuestion);
    cy.log('should have links to the source');
    SmartSnippetSelectors.sourceUrl().should(
      'have.attr',
      'href',
      defaultSourceUrl
    );
    SmartSnippetSelectors.sourceUrl().should('have.text', defaultSourceUrl);
    SmartSnippetSelectors.sourceTitle().should(
      'have.attr',
      'href',
      defaultSourceUrl
    );
    SmartSnippetSelectors.sourceTitle()
      .find('atomic-result-text')
      .find('atomic-text')
      .shadow()
      .should('contain.text', defaultSourceTitle);
    SmartSnippetAssertions.assertLikeButtonChecked(false);
    SmartSnippetAssertions.assertDislikeButtonChecked(false);
    SmartSnippetAssertions.assertThankYouBanner(false);
  });

  it('with a specific heading level, should use the correct heading level for heading and question', () => {
    const headingLevel = 5;
    new TestFixture()
      .with(addSmartSnippet({props: {'heading-level': 5}}))
      .init();

    SmartSnippetSelectors.accessibilityHeading().should(
      'have.prop',
      'tagName',
      'H' + headingLevel
    );
    SmartSnippetSelectors.question().should(
      'have.prop',
      'tagName',
      'H' + (headingLevel + 1)
    );
  });

  it('when maximumHeight is smaller than collapsedHeight, it should display errors', () => {
    const value = 50;
    new TestFixture()
      .with(
        addSmartSnippet({
          props: {
            'maximum-height': value - 1,
            'collapsed-height': value,
          },
        })
      )
      .init();
    CommonAssertions.assertConsoleErrorWithoutIt(true);
    CommonAssertions.assertContainsComponentErrorWithoutIt(
      SmartSnippetSelectors,
      true
    );
  });

  it('when snippetMaximumHeight is smaller than snippetCollapsedHeight, it should display errors', () => {
    const value = 50;
    new TestFixture()
      .with(
        addSmartSnippet({
          props: {
            'snippet-maximum-height': value - 1,
            'snippet-collapsed-height': value,
          },
        })
      )
      .init();

    CommonAssertions.assertConsoleErrorWithoutIt(true);
    CommonAssertions.assertContainsComponentErrorWithoutIt(
      SmartSnippetSelectors,
      true
    );
  });

  it('when the snippet height is equal to maximumHeight, it should not display show more and show less buttons', () => {
    const height = 300;
    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer: buildAnswerWithHeight(height),
          },
          props: {
            'maximum-height': height,
            'collapsed-height': 150,
          },
        })
      )
      .init();

    SmartSnippetAssertions.assertShowMore(false);
    SmartSnippetAssertions.assertShowLess(false);
  });

  it.skip('when the snippet height is equal to snippetMaximumHeight, it should not display show more and show less buttons', () => {
    const height = 300;
    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer: buildAnswerWithHeight(height),
          },
          props: {
            'snippet-maximum-height': height,
            'snippet-collapsed-height': 150,
          },
        })
      )
      .init();

    SmartSnippetAssertions.assertShowMore(false);
    SmartSnippetAssertions.assertShowLess(false);
  });

  it('when the snippet height is greater than maximumHeight', () => {
    const height = 300;
    const heightWhenCollapsed = 150;

    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer: buildAnswerWithHeight(height),
          },
          props: {
            'maximum-height': height - 1,
            'collapsed-height': heightWhenCollapsed,
          },
        })
      )
      .init();

    // before expand
    SmartSnippetAssertions.assertShowMore(true);
    SmartSnippetAssertions.assertShowLess(false);
    SmartSnippetAssertions.assertAnswerHeight(heightWhenCollapsed);
    CommonAssertions.assertAccessibility(smartSnippetComponent);
    SmartSnippetSelectors.showMoreButton().click();

    // after expand
    SmartSnippetSelectors.body().should('have.attr', 'expanded');
    SmartSnippetAssertions.assertShowMore(false);
    SmartSnippetAssertions.assertShowLess(true);
    SmartSnippetAssertions.assertAnswerHeight(height);
    SmartSnippetSelectors.showLessButton().click();

    // after collapse
    SmartSnippetSelectors.body().should('not.have.attr', 'expanded');
    SmartSnippetAssertions.assertShowMore(true);
    SmartSnippetAssertions.assertShowLess(false);
    SmartSnippetAssertions.assertAnswerHeight(heightWhenCollapsed);
  });

  it('when the snippet height is greater than snippetMaximumHeight', () => {
    const height = 300;
    const heightWhenCollapsed = 150;
    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer: buildAnswerWithHeight(height),
          },
          props: {
            'snippet-maximum-height': height - 1,
            'snippet-collapsed-height': heightWhenCollapsed,
          },
        })
      )
      .init();

    // before expand
    SmartSnippetAssertions.assertShowMore(true);
    SmartSnippetAssertions.assertShowLess(false);
    SmartSnippetAssertions.assertCollapseWrapperHeight(heightWhenCollapsed);
    CommonAssertions.assertAccessibility(smartSnippetComponent);
    SmartSnippetSelectors.showMoreButton().click();

    // after expand
    SmartSnippetSelectors.collapseWrapperComponent().should(
      'have.class',
      'expanded'
    );
    SmartSnippetAssertions.assertShowMore(false);
    SmartSnippetAssertions.assertShowLess(true);
    SmartSnippetAssertions.assertAnswerHeight(height);
    SmartSnippetSelectors.showLessButton().click();

    // after collapse
    SmartSnippetSelectors.collapseWrapperComponent().should(
      'not.have.class',
      'expanded'
    );
    SmartSnippetAssertions.assertShowMore(true);
    SmartSnippetAssertions.assertShowLess(false);
    SmartSnippetAssertions.assertCollapseWrapperHeight(heightWhenCollapsed);
    CommonAssertions.assertAccessibility(smartSnippetComponent);
  });

  it('when the snippet starts and ends with inline elements', () => {
    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer:
              '<span class="first">Abc</span><p>def</p><span class="last">ghi</span>',
          },
          props: {
            'maximum-height': Number.MAX_VALUE,
            'collapsed-height': 0,
            'snippet-style': 'span { display: block; }',
          },
        })
      )
      .init();
    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  it('it behaves correctly when the snippet contains elements with margins', () => {
    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer:
              '<p class="first">Paragraph A</p><p>Paragraph B</p><p class="last">Paragraph C</p>',
          },
          props: {
            'maximum-height': Number.MAX_VALUE,
            'collapsed-height': 0,
          },
        })
      )
      .init();

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  it('it behaves correctly when the snippet contains collapsing margins', () => {
    new TestFixture()
      .with(
        addSmartSnippet({
          snippet: {
            ...defaultSnippet,
            answer:
              '<span><p class="first last">My parent has no margins, but I do!</p></span>',
          },
          props: {
            'maximum-height': Number.MAX_VALUE,
            'collapsed-height': 0,
          },
        })
      )
      .init();

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  it('it behaves correctly when pressing the like and dislike button', () => {
    new TestFixture().with(addSmartSnippet()).init();
    SmartSnippetSelectors.feedbackLikeButton().click();

    SmartSnippetAssertions.assertLikeButtonChecked(true);
    SmartSnippetAssertions.assertDislikeButtonChecked(false);
    SmartSnippetAssertions.assertThankYouBanner(true);

    SmartSnippetAssertions.assertLogLikeSmartSnippet();

    SmartSnippetSelectors.feedbackDislikeButton().click();
    SmartSnippetAssertions.assertLikeButtonChecked(false);
    SmartSnippetAssertions.assertDislikeButtonChecked(true);
    SmartSnippetAssertions.assertThankYouBanner(true);

    SmartSnippetAssertions.assertLogDislikeSmartSnippet();
  });

  it('when interacting with the title and the like button', () => {
    let currentQuestion = defaultQuestion;
    new TestFixture()
      .with(
        addSmartSnippet({
          get snippet() {
            return {
              ...defaultSnippet,
              question: currentQuestion,
            };
          },
        })
      )
      .with(addSearchBox())
      .init();
    SmartSnippetSelectors.sourceTitle().rightclick();

    SmartSnippetAssertions.assertLogOpenSmartSnippetSource(true);

    //liking the snippet then clicking the title again
    SmartSnippetSelectors.feedbackLikeButton().click();
    AnalyticsTracker.reset();
    SmartSnippetSelectors.sourceTitle().rightclick();
    SmartSnippetAssertions.assertLogOpenSmartSnippetSource(false);

    // getting a new snippet and clicking on the title again
    currentQuestion = 'Hello, World!';
    SearchBoxSelectors.submitButton().click();
    SmartSnippetSelectors.sourceTitle().rightclick();
    SmartSnippetAssertions.assertLogOpenSmartSnippetSource(true);
  });

  it('when interacting with an inline link', () => {
    function click(selector: Cypress.Chainable<JQuery<HTMLAnchorElement>>) {
      selector.rightclick().then(([el]) => {
        lastClickedLink = {linkText: el.innerText, linkURL: el.href};
      });
    }
    let lastClickedLink: InlineLink;
    let currentQuestion: string;

    currentQuestion = defaultQuestion;
    new TestFixture()
      .with(
        addSmartSnippet({
          get snippet() {
            return {
              ...defaultSnippet,
              question: currentQuestion,
            };
          },
        })
      )
      .with(addSearchBox())
      .init();
    click(SmartSnippetSelectors.answer().find('a').eq(0));

    SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(
      () => lastClickedLink
    );

    // liking the snippet then clicking on the same inline link again
    SmartSnippetSelectors.feedbackLikeButton().click();
    AnalyticsTracker.reset();
    click(SmartSnippetSelectors.answer().find('a').eq(0));
    SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(null);

    // getting a new snippet and clicking on the same inline link again
    currentQuestion = 'Hello, World!';
    SearchBoxSelectors.submitButton().click();
    AnalyticsTracker.reset();
    SmartSnippetSelectors.question().should('have.text', currentQuestion);
    click(SmartSnippetSelectors.answer().find('a').eq(0));
    SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(
      () => lastClickedLink
    );

    // clicking a different inline link
    AnalyticsTracker.reset();
    click(SmartSnippetSelectors.answer().find('a').eq(1));
    SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(
      () => lastClickedLink
    );
  });

  describe('when parts of the snippet change', () => {
    const newSnippet = defaultSnippets[1];
    let currentSnippet: AddSmartSnippetMockSnippet;

    function updateSnippet(key: keyof AddSmartSnippetMockSnippet) {
      currentSnippet = {...defaultSnippet, [key]: newSnippet[key]};
      SearchBoxSelectors.submitButton().click();
    }

    beforeEach(() => {
      currentSnippet = defaultSnippet;
      new TestFixture()
        .with(
          addSmartSnippet({
            get snippet() {
              return currentSnippet;
            },
          })
        )
        .with(addSearchBox())
        .init();
      SmartSnippetSelectors.question().should(
        'contain.text',
        defaultSnippet.question
      );
      SmartSnippetSelectors.answer().should(
        'contain.html',
        defaultSnippet.answer
      );
      SmartSnippetSelectors.sourceTitle()
        .find('atomic-result-text')
        .find('atomic-text')
        .shadow()
        .should('contain.text', defaultSnippet.sourceTitle);
      SmartSnippetSelectors.sourceUrl().should(
        'contain.text',
        defaultSnippet.sourceUrl
      );
    });

    it('when the question is updated, the new title is rendered', () => {
      updateSnippet('question');
      SmartSnippetSelectors.question().should(
        'contain.text',
        newSnippet.question
      );
    });

    it('when the answer is updated, the new answer is rendered', () => {
      updateSnippet('answer');
      SmartSnippetSelectors.answer().should('contain.html', newSnippet.answer);
    });

    it('when the source title is updated, the new source is rendered', () => {
      updateSnippet('sourceTitle');
      SmartSnippetSelectors.sourceTitle()
        .find('atomic-result-text')
        .find('atomic-text')
        .shadow()
        .should('contain.text', newSnippet.sourceTitle);
    });

    it('when the source url is updated, the new source is rendered', () => {
      updateSnippet('sourceUrl');
      SmartSnippetSelectors.sourceUrl().should(
        'contain.text',
        newSnippet.sourceUrl
      );
    });
  });

  it('with custom styling in a template element', () => {
    const styleEl = generateComponentHTML('style');
    styleEl.innerHTML = `
        b {
          color: rgb(84, 170, 255);
        }
      `;

    const templateEl = generateComponentHTML('template') as HTMLTemplateElement;
    templateEl.content.appendChild(styleEl);
    new TestFixture().with(addSmartSnippet({content: templateEl})).init();

    SmartSnippetSelectors.answer()
      .find('b')
      .invoke('css', 'color')
      .should('equal', 'rgb(84, 170, 255)');
  });

  it('with custom styling in an attribute', () => {
    const style = `
        b {
          color: rgb(84, 170, 255);
        }
      `;
    new TestFixture()
      .with(
        addSmartSnippet({
          props: {'snippet-style': style},
        })
      )
      .init();

    SmartSnippetSelectors.answer()
      .find('b')
      .invoke('css', 'color')
      .should('equal', 'rgb(84, 170, 255)');
  });

  it('when there is a valid slot named "source-anchor-attributes"', () => {
    const slot = generateComponentHTML('a', {
      target: '_blank',
      slot: 'source-anchor-attributes',
    });
    new TestFixture().with(addSmartSnippet({}, slot)).init();

    SmartSnippetSelectors.sourceUrl().should('have.attr', 'target', '_blank');
  });
});
