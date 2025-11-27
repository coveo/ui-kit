import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-fields-list',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult();
const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: engineConfig,
});

const meta: Meta = {
  component: 'atomic-result-fields-list',
  title: 'Search/ResultList/ResultFieldsList',
  id: 'atomic-result-fields-list',
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
  name: 'atomic-result-fields-list',
  args: {
    'default-slot': `
      <style>
        .field {
          display: inline-flex;
          white-space: nowrap;
          align-items: center;
        }
        .field-label {
          font-weight: bold;
          margin-right: 0.25rem;
        }
      </style>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label"
          ><atomic-text value="author"></atomic-text>:</span
        >
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label"
          ><atomic-text value="source"></atomic-text>:</span
        >
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="language">
        <span class="field-label"
          ><atomic-text value="language"></atomic-text>:</span
        >
        <atomic-result-multi-value-text
          field="language"
        ></atomic-result-multi-value-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="filetype">
        <span class="field-label"
          ><atomic-text value="fileType"></atomic-text>:</span
        >
        <atomic-result-text field="filetype"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="sncost">
        <span class="field-label">Cost:</span>
        <atomic-result-number field="sncost">
          <atomic-format-currency currency="CAD"></atomic-format-currency>
        </atomic-result-number>
      </atomic-field-condition>

      <span class="field">
        <span class="field-label">Date:</span>
        <atomic-result-date></atomic-result-date>
      </span>
    `,
  },
};
