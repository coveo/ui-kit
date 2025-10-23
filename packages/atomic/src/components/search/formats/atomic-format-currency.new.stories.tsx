import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-format-currency',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const request = JSON.parse(r.body!.toString());
    request.cq = '@sncost>0';
    request.fieldsToInclude = ['sncost'];
    request.numberOfResults = 1;
    r.body = JSON.stringify(request);
    return r;
  },
});

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

const meta: Meta = {
  component: 'atomic-format-currency',
  title: 'Search/Format/atomic-format-currency',
  id: 'atomic-format-currency',

  render: (args) => template(args),
  decorators: [searchInterfaceDecorator],
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

export const Facet: Story = {
  name: 'Within Numeric Facet',
  decorators: [
    (story) => html`
      <atomic-numeric-facet field="sncost"> ${story()} </atomic-numeric-facet>
    `,
  ],
  args: {
    currency: 'USD',
  },
};

export const Result: Story = {
  name: 'Within Numeric Result',
  decorators: [
    (story) => html`
      <atomic-result-number field="sncost"> ${story()} </atomic-result-number>
    `,
    resultDecorator,
  ],
  args: {
    currency: 'USD',
  },
};
