import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {SmartSnippetSelectors} from './smart-snippet-selectors';
import * as CommonAssertions from './common-assertions';
import * as SmartSnippetAssertions from './smart-snippet-assertions';

const remSize = 12;
const defaultQuestion = 'Creating an In-Product Experience (IPX)';
const defaultAnswer = `
  <ol>
    <li>On the <b>In-Product Experiences</b> page, click Add <b>In-Product Experience</b>.</li>
    <li>In the Configuration tab, fill the Basic settings section.</li>
    <li>(Optional) Use the Design and Content access tabs to customize your <b>IPX</b> interface.</li>
    <li>Click Save.</li>
    <li>In the Loader snippet panel that appears, you may click Copy to save the loader snippet for your <b>IPX</b> to your clipboard, and then click Save.  You can Always retrieve the loader snippet later.</li>
  </ol>

  <p>
    You're now ready to load your IPX interface in the desired web site or application. However, we recommend that you configure query pipelines for your IPX interface before.
  </p>
`;
const defaultSourceTitle = 'Manage the Coveo In-Product Experiences (IPX)';
const defaultSourceUrl = 'https://docs.coveo.com/en/3160';

interface AddSmartSnippetOptions {
  props?: {
    'heading-level'?: number;
    'minimum-snippet-height-for-show-more'?: number;
    'answer-height-when-collapsed'?: number;
  };
  question?: string;
  answer?: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

const addSmartSnippet =
  (options: AddSmartSnippetOptions = {}) =>
  (fixture: TestFixture) => {
    fixture
      .withStyle(`html { font-size: ${remSize}px; }`)
      .withElement(generateComponentHTML('atomic-smart-snippet', options.props))
      .withCustomResponse((response) => {
        const [result] = response.results;
        result.title = options.sourceTitle ?? defaultSourceTitle;
        result.clickUri = options.sourceUrl ?? defaultSourceUrl;
        response.questionAnswer = {
          documentId: {
            contentIdKey: 'permanentid',
            contentIdValue: result.raw.permanentid!,
          },
          question: options.question ?? defaultQuestion,
          answerSnippet: options.answer ?? defaultAnswer,
          relatedQuestions: [],
          score: 1337,
        };
      });
  };

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
              'minimum-snippet-height-for-show-more': value - 1,
              'answer-height-when-collapsed': value,
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
              'minimum-snippet-height-for-show-more': height,
              'answer-height-when-collapsed': 150,
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
              'minimum-snippet-height-for-show-more': height - 1,
              'answer-height-when-collapsed': heightWhenCollapsed,
            },
          })
        )
        .init();
    });

    SmartSnippetAssertions.assertShowMore(true);
    SmartSnippetAssertions.assertShowLess(false);
    SmartSnippetAssertions.assertAnswerHeight(heightWhenCollapsed);

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
      });
    });
  });

  describe('when the snippet starts and ends with text nodes', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer: 'Abc<p>def</p>ghi',
            props: {
              'minimum-snippet-height-for-show-more': 2 * remSize,
              'answer-height-when-collapsed': 0,
            },
          })
        )
        .init();
    });

    describe('and the snippet is expanded', () => {
      before(() => {
        SmartSnippetSelectors.showMoreButton().click();
      });

      SmartSnippetAssertions.assertAnswerTopMargin(remSize);
      SmartSnippetAssertions.assertAnswerBottomMargin(remSize);
    });
  });

  describe('when the snippet contains elements with margins', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer: '<p>Paragraph A</p><p>Paragraph B</p><p>Paragraph C</p>',
            props: {
              'minimum-snippet-height-for-show-more': 2 * remSize,
              'answer-height-when-collapsed': 0,
            },
          })
        )
        .init();
    });

    describe('and the snippet is expanded', () => {
      before(() => {
        SmartSnippetSelectors.showMoreButton().click();
      });

      SmartSnippetAssertions.assertAnswerTopMargin(remSize);
      SmartSnippetAssertions.assertAnswerBottomMargin(remSize);
    });
  });

  describe('when the snippet contains collapsing margins', () => {
    before(() => {
      new TestFixture()
        .with(
          addSmartSnippet({
            answer: '<span><p>My parent has no margins, but I do!</p></span>',
            props: {
              'minimum-snippet-height-for-show-more': 2 * remSize,
              'answer-height-when-collapsed': 0,
            },
          })
        )
        .init();
    });

    describe('and the snippet is expanded', () => {
      before(() => {
        SmartSnippetSelectors.showMoreButton().click();
      });

      SmartSnippetAssertions.assertAnswerTopMargin(remSize);
      SmartSnippetAssertions.assertAnswerBottomMargin(remSize);
    });
  });
});
