import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {
  smartSnippetComponent,
  SmartSnippetSelectors,
} from './smart-snippet-selectors';
import * as CommonAssertions from './common-assertions';
import * as SmartSnippetAssertions from './smart-snippet-assertions';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import {addSearchBox} from './search-box/search-box-actions';
import {SearchBoxSelectors} from './search-box/search-box-selectors';
import {
  addSmartSnippet,
  addSmartSnippetDefaultOptions,
} from './smart-snippet-actions';

const {
  remSize,
  question: defaultQuestion,
  sourceTitle: defaultSourceTitle,
  sourceUrl: defaultSourceUrl,
} = addSmartSnippetDefaultOptions;

function buildAnswerWithHeight(height: number) {
  const heightWithoutMargins = height - remSize * 2;
  return `<div style="height: ${heightWithoutMargins}px; background-color: red;"></div>`;
}

describe('Smart Snippet Test Suites', () => {
  describe('with no heading level', () => {
    before(() => {
      new TestFixture().with(addSmartSnippet()).init();
    });

    it('should fallback to a div for the accessibility heading', () => {
      SmartSnippetSelectors.accessibilityHeading().should(
        'have.prop',
        'tagName',
        'DIV'
      );
    });

    it('should fallback to a div for the question', () => {
      SmartSnippetSelectors.question().should('have.prop', 'tagName', 'DIV');
    });

    it('render the correct question', () => {
      SmartSnippetSelectors.question().should('have.text', defaultQuestion);
    });

    it('should have links to the source', () => {
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
      SmartSnippetSelectors.sourceTitle().should(
        'have.text',
        defaultSourceTitle
      );
    });

    SmartSnippetAssertions.assertLikeButtonChecked(false);
    SmartSnippetAssertions.assertDislikeButtonChecked(false);
    SmartSnippetAssertions.assertThankYouBanner(false);
  });

  describe('with a specific heading level', () => {
    const headingLevel = 5;
    before(() => {
      new TestFixture()
        .with(addSmartSnippet({props: {'heading-level': headingLevel}}))
        .init();
    });

    it('should use the correct heading level for the accessibility heading', () => {
      SmartSnippetSelectors.accessibilityHeading().should(
        'have.prop',
        'tagName',
        'H' + headingLevel
      );
    });

    it('should use the correct heading level for the question', () => {
      SmartSnippetSelectors.question().should(
        'have.prop',
        'tagName',
        'H' + (headingLevel + 1)
      );
    });
  });

  describe('when maximumHeight is smaller than collapsedHeight', () => {
    before(() => {
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
    });

    CommonAssertions.assertConsoleError(true);
    CommonAssertions.assertContainsComponentError(SmartSnippetSelectors, true);
  });

  describe('when the snippet height is equal to maximumHeight', () => {
    before(() => {
      const height = 300;
      new TestFixture()
        .with(
          addSmartSnippet({
            answer: buildAnswerWithHeight(height),
            props: {
              'maximum-height': height,
              'collapsed-height': 150,
            },
          })
        )
        .init();
    });

    SmartSnippetAssertions.assertShowMore(false);
    SmartSnippetAssertions.assertShowLess(false);
  });

  describe('when the snippet height is greater than maximumHeight', () => {
    const height = 300;
    const heightWhenCollapsed = 150;
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer: buildAnswerWithHeight(height),
            props: {
              'maximum-height': height - 1,
              'collapsed-height': heightWhenCollapsed,
            },
          })
        )
        .init();
    });

    SmartSnippetAssertions.assertShowMore(true);
    SmartSnippetAssertions.assertShowLess(false);
    SmartSnippetAssertions.assertAnswerHeight(heightWhenCollapsed);
    CommonAssertions.assertAccessibility(smartSnippetComponent);

    describe('then pressing show more', () => {
      before(() => {
        SmartSnippetSelectors.showMoreButton().click();
      });

      SmartSnippetAssertions.assertShowMore(false);
      SmartSnippetAssertions.assertShowLess(true);
      SmartSnippetAssertions.assertAnswerHeight(height);

      describe('then pressing show less', () => {
        before(() => {
          SmartSnippetSelectors.showLessButton().click();
        });

        SmartSnippetAssertions.assertShowMore(true);
        SmartSnippetAssertions.assertShowLess(false);
        SmartSnippetAssertions.assertAnswerHeight(heightWhenCollapsed);
        CommonAssertions.assertAccessibility(smartSnippetComponent);
      });
    });
  });

  describe('when the snippet starts and ends with inline elements', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer:
              '<span class="first">Abc</span><p>def</p><span class="last">ghi</span>',
            props: {
              'maximum-height': Number.MAX_VALUE,
              'collapsed-height': 0,
              'snippet-style': 'span { display: block; }',
            },
          })
        )
        .init();
    });

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('when the snippet contains elements with margins', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer:
              '<p class="first">Paragraph A</p><p>Paragraph B</p><p class="last">Paragraph C</p>',
            props: {
              'maximum-height': Number.MAX_VALUE,
              'collapsed-height': 0,
            },
          })
        )
        .init();
    });

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('when the snippet contains collapsing margins', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer:
              '<span><p class="first last">My parent has no margins, but I do!</p></span>',
            props: {
              'maximum-height': Number.MAX_VALUE,
              'collapsed-height': 0,
            },
          })
        )
        .init();
    });

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('after pressing the like button', () => {
    before(() => {
      new TestFixture().with(addSmartSnippet()).init();
      SmartSnippetSelectors.feedbackLikeButton().click();
    });

    SmartSnippetAssertions.assertLikeButtonChecked(true);
    SmartSnippetAssertions.assertDislikeButtonChecked(false);
    SmartSnippetAssertions.assertThankYouBanner(true);
    SmartSnippetAssertions.assertLogLikeSmartSnippet();
  });

  describe('after pressing the dislike button', () => {
    before(() => {
      new TestFixture().with(addSmartSnippet()).init();
      SmartSnippetSelectors.feedbackDislikeButton().click();
    });

    SmartSnippetAssertions.assertLikeButtonChecked(false);
    SmartSnippetAssertions.assertDislikeButtonChecked(true);
    SmartSnippetAssertions.assertThankYouBanner(true);
    SmartSnippetAssertions.assertLogDislikeSmartSnippet();
  });

  describe('after clicking on the title', () => {
    let currentQuestion: string | undefined = undefined;
    beforeEach(() => {
      currentQuestion = undefined;
      new TestFixture()
        .with(
          addSmartSnippet({
            get question() {
              return currentQuestion;
            },
          })
        )
        .with(addSearchBox())
        .init();
      SmartSnippetSelectors.sourceTitle().rightclick();
    });

    SmartSnippetAssertions.assertlogOpenSmartSnippetSource(true);

    describe('then liking the snippet then clicking the title again', () => {
      beforeEach(() => {
        SmartSnippetSelectors.feedbackLikeButton().click();
        AnalyticsTracker.reset();
        SmartSnippetSelectors.sourceTitle().rightclick();
      });

      SmartSnippetAssertions.assertlogOpenSmartSnippetSource(false);
    });

    describe('then getting a new snippet and clicking on the title again', () => {
      beforeEach(() => {
        currentQuestion = 'Hello, World!';
        SearchBoxSelectors.submitButton().click();
        SmartSnippetSelectors.sourceTitle().rightclick();
      });

      SmartSnippetAssertions.assertlogOpenSmartSnippetSource(true);
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
      new TestFixture().with(addSmartSnippet({content: templateEl})).init();
    });

    it('applies the styling to the rendered snippet', () => {
      SmartSnippetSelectors.answer()
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
          addSmartSnippet({
            props: {'snippet-style': style},
          })
        )
        .init();
    });

    it('applies the styling to the rendered snippet', () => {
      SmartSnippetSelectors.answer()
        .find('b')
        .invoke('css', 'color')
        .should('equal', 'rgb(84, 170, 255)');
    });
  });
});
