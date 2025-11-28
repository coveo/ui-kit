import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-image',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results.forEach((r) => {
        r.raw.randomimage = 'https://picsum.photos/200';
        r.raw.someAltField = 'Some alt value';
      });
      return res;
    },
  },
});
const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

const meta: Meta = {
  component: 'atomic-result-image',
  title: 'Search/ResultList/ResultImage',
  id: 'atomic-result-image',
  render: (args) => template(args),
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-image',
  args: {
    field: 'randomimage',
  },
};

export const withAnAltTextField: Story = {
  name: 'With an alt text field',
  args: {
    field: 'randomimage',
    'image-alt-field': 'someAltField',
  },
};

export const withFallbackImage: Story = {
  name: 'With fallback image',
  args: {
    field: 'nonexistentfield',
    fallback: 'https://picsum.photos/200/200',
  },
};
