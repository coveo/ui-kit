import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-number',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (request) => {
    const parsed = JSON.parse(request.body as string);
    parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'size'];
    parsed.numberOfResults = 1;
    request.body = JSON.stringify(parsed);
    return request;
  },
});

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

const meta: Meta = {
  component: 'atomic-result-number',
  title: 'Search/Result Number',
  id: 'atomic-result-number',
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
  args: {
    field: 'size',
  },
};

export const WithCurrencyFormatting: Story = {
  name: 'With currency formatting',
  args: {
    field: 'size',
    'default-slot': `
      <atomic-format-currency currency="USD" currency-display="code" minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-currency>
    `,
  },
};

export const WithNumberFormatting: Story = {
  name: 'With number formatting',
  args: {
    field: 'size',
    'default-slot': `<atomic-format-number minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-number>`,
  },
};

export const WithUnitFormatting: Story = {
  name: 'With unit formatting',
  args: {
    field: 'size',
    'default-slot': `
      <atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>
    `,
  },
};
