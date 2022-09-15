import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {toArray} from '../utils/arrayUtils';

export interface AddSmartSnippetOptions {
  remSize?: number;
  props?: {
    'heading-level'?: number;
    'maximum-height'?: number;
    'collapsed-height'?: number;
    'snippet-style'?: string;
  };
  content?: HTMLElement | HTMLElement[];
  question?: string;
  answer?: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

export const addSmartSnippetDefaultOptions: Required<AddSmartSnippetOptions> = {
  remSize: 12,
  props: {},
  content: [],
  question: 'Creating an In-Product Experience (IPX)',
  answer: `
    <ol>
      <li>On the <a href="https://platform.cloud.coveo.com/admin/#/orgid/search/in-app-widgets/">In-Product Experiences</a> page, click Add <b>In-Product Experience</b>.</li>
      <li>In the Configuration tab, fill the Basic settings section.</li>
      <li>(Optional) Use the Design and Content access tabs to <a href="https://docs.coveo.com/en/3160/#customizing-an-ipx-interface">customize your <b>IPX</b> interface</a>.</li>
      <li>Click Save.</li>
      <li>In the Loader snippet panel that appears, you may click Copy to save the loader snippet for your <b>IPX</b> to your clipboard, and then click Save.  You can Always retrieve the loader snippet later.</li>
    </ol>

    <p>
      You're now ready to <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#embed-your-ipx-interface-in-sites-and-applications">embed your IPX interface</a>. However, we recommend that you <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#configuring-query-pipelines-for-an-ipx-interface-recommended">configure query pipelines for your IPX interface</a> before.
    </p>
  `,
  sourceTitle: 'Manage the Coveo In-Product Experiences (IPX)',
  sourceUrl: 'https://docs.coveo.com/en/3160',
};

export const addSmartSnippet =
  (options: AddSmartSnippetOptions = {}) =>
  (fixture: TestFixture) => {
    const element = generateComponentHTML(
      'atomic-smart-snippet',
      options.props ?? addSmartSnippetDefaultOptions.props
    );
    element.append(
      ...toArray(options.content ?? addSmartSnippetDefaultOptions.content)
    );
    fixture
      .withStyle(
        `html { font-size: ${
          options.remSize ?? addSmartSnippetDefaultOptions.remSize
        }px; }`
      )
      .withElement(element)
      .withCustomResponse((response) => {
        const [result] = response.results;
        result.title =
          options.sourceTitle ?? addSmartSnippetDefaultOptions.sourceTitle;
        result.clickUri =
          options.sourceUrl ?? addSmartSnippetDefaultOptions.sourceUrl;
        response.questionAnswer = {
          documentId: {
            contentIdKey: 'permanentid',
            contentIdValue: result.raw.permanentid!,
          },
          question: options.question ?? addSmartSnippetDefaultOptions.question,
          answerSnippet: options.answer ?? addSmartSnippetDefaultOptions.answer,
          relatedQuestions: [],
          score: 1337,
        };
      });
  };
