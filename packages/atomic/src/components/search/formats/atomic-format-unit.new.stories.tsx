import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-format-unit',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const request = JSON.parse(r.body!.toString());
    request.cq = '@size>0';
    request.fieldsToInclude = ['size'];
    request.numberOfResults = 1;
    r.body = JSON.stringify(request);
    return r;
  },
});

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

const meta: Meta = {
  component: 'atomic-format-unit',
  title: 'Search/Format/atomic-format-unit',
  id: 'atomic-format-unit',

  render: (args) => template(args),
  decorators: [searchInterfaceDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,

  play,
  args: {...args, unit: 'byte'},
};

export default meta;

export const Facet: Story = {
  name: 'Within Numeric Facet',
  decorators: [
    (story) => html`
      <atomic-numeric-facet field="size"> ${story()} </atomic-numeric-facet>
    `,
  ],
};

export const Result: Story = {
  name: 'Within Numeric Result',
  decorators: [
    (story) => html`
      <atomic-result-number field="size"> ${story()} </atomic-result-number>
    `,
    resultDecorator,
  ],
};
