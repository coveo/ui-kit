import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-number',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'size'];
      parsed.numberOfResults = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);

const meta: Meta = {
  component: 'atomic-result-number',
  title: 'Search/Result Number',
  id: 'atomic-result-number',
  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
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
  },
  render: (args) =>
    html`<atomic-result-number field=${args.field}>
      ${unsafeHTML(
        '<atomic-format-currency currency="USD" currency-display="code" minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-currency>'
      )}
    </atomic-result-number>`,
};

export const WithNumberFormatting: Story = {
  name: 'With number formatting',
  args: {
    field: 'size',
  },
  render: (args) =>
    html`<atomic-result-number field=${args.field}>
      ${unsafeHTML(
        '<atomic-format-number minimum-fraction-digits="2" maximum-fraction-digits="2"></atomic-format-number>'
      )}
    </atomic-result-number>`,
};

export const WithUnitFormatting: Story = {
  name: 'With unit formatting',
  args: {
    field: 'size',
  },
  render: (args) =>
    html`<atomic-result-number field=${args.field}>
      ${unsafeHTML(
        '<atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>'
      )}
    </atomic-result-number>`,
};
