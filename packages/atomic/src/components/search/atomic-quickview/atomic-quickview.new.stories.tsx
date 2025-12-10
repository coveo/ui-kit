import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

// biome-ignore lint/suspicious/noExplicitAny: Mock API response types are loosely defined
searchApiHarness.searchEndpoint.mock((response: any) => ({
  ...response,
  // biome-ignore lint/suspicious/noExplicitAny: Mock API result types are loosely defined
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

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-quickview',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-quickview',
  title: 'Search/Quickview',
  id: 'atomic-quickview',

  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const CustomSandbox: Story = {
  name: 'With custom sandbox attributes',
  args: {
    sandbox:
      'allow-scripts allow-popups allow-top-navigation allow-same-origin',
  },
};
