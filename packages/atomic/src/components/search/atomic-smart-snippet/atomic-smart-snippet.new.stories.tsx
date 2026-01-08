import type {Result} from '@coveo/headless';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-smart-snippet',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-smart-snippet',
  title: 'Search/Smart Snippet',
  id: 'atomic-smart-snippet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
    mockSearchApi.searchEndpoint.mockOnce((response) => {
      if (!('results' in response)) return response;
      const [result] = response.results as Result[];
      return {
        ...response,
        results: [
          {
            ...result,
            title: 'Manage the Coveo In-Product Experiences (IPX)',
            clickUri: 'https://docs.coveo.com/en/3160',
          },
          ...response.results.slice(1),
        ],
        questionAnswer: {
          answerFound: true,
          documentId: {
            contentIdKey: 'permanentid',
            contentIdValue: result.raw.permanentid,
          },
          question: 'Creating an In-Product Experience (IPX)',
          answerSnippet: `
            <ol>
              <li>On the <a href="https://platform.cloud.coveo.com/admin/#/orgid/search/in-app-widgets/">In-Product Experiences</a> page, click Add <b>In-Product Experience</b>.</li>
              <li>In the Configuration tab, fill the Basic settings section.</li>
              <li>(Optional) Use the Design and Content access tabs to <a href="https://docs.coveo.com/en/3160/#customizing-an-ipx-interface">customize your <b>IPX</b> interface</a>.</li>
              <li>Click Save.</li>
              <li>In the Loader snippet panel that appears, you may click Copy to save the loader snippet for your <b>IPX</b> to your clipboard, and then click Save. You can always retrieve the loader snippet later.</li>
            </ol>
            <p>
              You're now ready to <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#embed-your-ipx-interface-in-sites-and-applications">embed your IPX interface</a>. However, we recommend that you <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#configuring-query-pipelines-for-an-ipx-interface-recommended">configure query pipelines for your IPX interface</a> before.
            </p>
          `,
          relatedQuestions: [],
          score: 1337,
        },
      };
    });
  },
  play,
};

export default meta;

export const Default: Story = {};
