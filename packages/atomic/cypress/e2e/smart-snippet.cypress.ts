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
    });

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('when the snippet contains elements with margins', () => {
    before(() => {
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
    });

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('when the snippet contains collapsing margins', () => {
    before(() => {
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
    });

    SmartSnippetAssertions.assertAnswerTopMargin(remSize, 'first');
    SmartSnippetAssertions.assertAnswerBottomMargin(remSize, 'last');
  });

  describe('after pressing the like button', () => {
    function setup() {
      new TestFixture().with(addSmartSnippet()).init();
      SmartSnippetSelectors.feedbackLikeButton().click();
    }

    describe('verify rendering', () => {
      before(setup);

      SmartSnippetAssertions.assertLikeButtonChecked(true);
      SmartSnippetAssertions.assertDislikeButtonChecked(false);
      SmartSnippetAssertions.assertThankYouBanner(true);
    });

    describe('verify analytics', () => {
      beforeEach(setup);

      SmartSnippetAssertions.assertLogLikeSmartSnippet();
    });
  });

  describe('after pressing the dislike button', () => {
    function setup() {
      new TestFixture().with(addSmartSnippet()).init();
      SmartSnippetSelectors.feedbackDislikeButton().click();
    }

    describe('verify rendering', () => {
      before(setup);

      SmartSnippetAssertions.assertLikeButtonChecked(false);
      SmartSnippetAssertions.assertDislikeButtonChecked(true);
      SmartSnippetAssertions.assertThankYouBanner(true);
    });

    describe('verify analytics', () => {
      beforeEach(setup);

      SmartSnippetAssertions.assertLogDislikeSmartSnippet();
    });
  });

  describe('after clicking on the title', () => {
    let currentQuestion: string;
    beforeEach(() => {
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
      SmartSnippetSelectors.sourceTitle().rightclick();
    });

    SmartSnippetAssertions.assertLogOpenSmartSnippetSource(true);

    describe('then liking the snippet then clicking the title again', () => {
      beforeEach(() => {
        SmartSnippetSelectors.feedbackLikeButton().click();
        AnalyticsTracker.reset();
        SmartSnippetSelectors.sourceTitle().rightclick();
      });

      SmartSnippetAssertions.assertLogOpenSmartSnippetSource(false);
    });

    describe('then getting a new snippet and clicking on the title again', () => {
      beforeEach(() => {
        currentQuestion = 'Hello, World!';
        SearchBoxSelectors.submitButton().click();
        SmartSnippetSelectors.sourceTitle().rightclick();
      });

      SmartSnippetAssertions.assertLogOpenSmartSnippetSource(true);
    });
  });

  describe('after clicking on an inline link', () => {
    let lastClickedLink: InlineLink;
    function click(selector: Cypress.Chainable<JQuery<HTMLAnchorElement>>) {
      selector.rightclick().then(([el]) => {
        lastClickedLink = {linkText: el.innerText, linkURL: el.href};
      });
    }

    let currentQuestion: string;
    beforeEach(() => {
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
    });

    SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(
      () => lastClickedLink
    );

    describe('then liking the snippet then clicking on the same inline link again', () => {
      beforeEach(() => {
        SmartSnippetSelectors.feedbackLikeButton().click();
        AnalyticsTracker.reset();
        click(SmartSnippetSelectors.answer().find('a').eq(0));
      });

      SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(null);
    });

    describe('then getting a new snippet and clicking on the same inline link again', () => {
      beforeEach(() => {
        currentQuestion = 'Hello, World!';
        SearchBoxSelectors.submitButton().click();
        AnalyticsTracker.reset();
        SmartSnippetSelectors.question().should('have.text', currentQuestion);
        click(SmartSnippetSelectors.answer().find('a').eq(0));
      });

      SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(
        () => lastClickedLink
      );
    });

    describe('then clicking a different inline link', () => {
      beforeEach(() => {
        AnalyticsTracker.reset();
        click(SmartSnippetSelectors.answer().find('a').eq(1));
      });

      SmartSnippetAssertions.assertLogOpenSmartSnippetInlineLink(
        () => lastClickedLink
      );
    });
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
      SmartSnippetSelectors.sourceTitle().should(
        'contain.text',
        defaultSnippet.sourceTitle
      );
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
      SmartSnippetSelectors.sourceTitle().should(
        'contain.text',
        newSnippet.sourceTitle
      );
    });

    it('when the source url is updated, the new source is rendered', () => {
      updateSnippet('sourceUrl');
      SmartSnippetSelectors.sourceUrl().should(
        'contain.text',
        newSnippet.sourceUrl
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
