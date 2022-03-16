import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

const question = 'Creating an In-Product Experience (IPX)';
const sourceTitle = 'Manage the Coveo In-Product Experiences (IPX)';
const sourceUrl = 'https://docs.coveo.com/en/3160';

const addSmartSnippet = (headingLevel?: number) => (fixture: TestFixture) => {
  fixture
    .withElement(
      generateComponentHTML(
        'atomic-smart-snippet',
        headingLevel !== undefined
          ? {
              'heading-level': headingLevel.toString(),
            }
          : {}
      )
    )
    .withCustomResponse((response) => {
      const [result] = response.results;
      result.title = sourceTitle;
      result.clickUri = sourceUrl;
      response.questionAnswer = {
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: result.raw.permanentid!,
        },
        question,
        answerSnippet: `
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
            `,
        relatedQuestions: [],
        score: 1337,
      };
    });
};

describe('Smart Snippet Test Suites', () => {
  describe('with no heading level', () => {
    beforeEach(() => {
      new TestFixture().with(addSmartSnippet()).init();
    });

    it('should fallback to a span for the accessibility heading', () => {
      SmartSnippetSelectors.accessibilityHeading().should(
        'have.prop',
        'tagName',
        'SPAN'
      );
    });

    it('should fallback to a span for the question', () => {
      SmartSnippetSelectors.question().should('have.prop', 'tagName', 'SPAN');
    });

    it('render the correct question', () => {
      SmartSnippetSelectors.question().should('have.text', question);
    });

    it('should have links to the source', () => {
      SmartSnippetSelectors.sourceUrl().should('have.attr', 'href', sourceUrl);
      SmartSnippetSelectors.sourceUrl().should('have.text', sourceUrl);
      SmartSnippetSelectors.sourceTitle().should(
        'have.attr',
        'href',
        sourceUrl
      );
      SmartSnippetSelectors.sourceTitle().should('have.text', sourceTitle);
    });
  });

  describe('with a specific heading level', () => {
    const headingLevel = 5;
    beforeEach(() => {
      new TestFixture().with(addSmartSnippet(headingLevel)).init();
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
});
