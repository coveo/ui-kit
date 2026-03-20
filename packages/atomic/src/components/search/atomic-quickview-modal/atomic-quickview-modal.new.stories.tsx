import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-quickview/atomic-quickview.js';
import '@/src/components/search/atomic-quickview-modal/atomic-quickview-modal.js';

const searchApiHarness = new MockSearchApi();

// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock API response types are loosely defined
searchApiHarness.searchEndpoint.mock((response: any) => ({
  ...response,
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- Mock API result types are loosely defined
  results: response.results.slice(0, 1).map((result: any) => ({
    ...result,
    title:
      "Australia's under-16s social media ban comes into effect | Global News Podcast",
    uri: 'https://youtube.com/User:bbcnews/Channel:UC16niRr50-MSBwiO3YDb3RA/Video:XjI_iE-sNcM',
    printableUri: 'https://www.youtube.com/watch?v=XjI_iE-sNcM',
    clickUri: 'https://www.youtube.com/watch?v=XjI_iE-sNcM',
    uniqueId:
      '42.13613$https://youtube.com/User:bbcnews/Channel:UC16niRr50-MSBwiO3YDb3RA/Video:XjI_iE-sNcM',
    excerpt:
      'Children under the age of 16 in Australia are no longer allowed to use social media. ... The Australian government said it is aimed at protecting kids from cyberbullying, online predators and harmf...',
    flags: 'HasHtmlVersion;HasThumbnail;HasAllMetaDataStream',
    hasHtmlVersion: true,
    raw: {
      ...result.raw,
      sysauthor: ['BBC News'],
      author: ['BBC News'],
      syslanguage: ['English'],
      language: ['English'],
      date: 1765317641000,
      sysdate: 1765317641000,
      sourcetype: 'YouTube',
      syssourcetype: 'YouTube',
      filetype: 'YouTubeVideo',
      sysfiletype: 'YouTubeVideo',
      source: 'Coveo Samples - Youtube BBC News',
      syssource: 'Coveo Samples - Youtube BBC News',
    },
  })),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, styleTemplate} = getStorybookHelpers(
  'atomic-quickview-modal',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-quickview-modal',
  title: 'Reference/Search/Quickview Modal',
  id: 'atomic-quickview-modal',
  render: () => html`<atomic-quickview></atomic-quickview>`,
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
    (story, {args}) => html` ${styleTemplate(args)} ${story()} `,
  ],
  parameters: {
    ...commonParameters,
    actions: {
      handles: events,
    },
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
        height: '600px',
      },
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  play: async (context) => {
    await play(context);
    const {canvasElement, step, userEvent} = context;
    // Wait for result to load and quickview button to be available
    await new Promise((resolve) => setTimeout(resolve, 500));
    const canvas = within(canvasElement);
    const quickviewButton = await canvas.findByShadowTitle('Quick View');
    await step('Open quickview modal', async () => {
      await userEvent.click(quickviewButton);
    });
    // Wait for the modal animation to complete (animation duration is 500ms)
    await new Promise((resolve) => setTimeout(resolve, 600));
  },
};

export const Closed: Story = {
  tags: ['!dev'],
};
