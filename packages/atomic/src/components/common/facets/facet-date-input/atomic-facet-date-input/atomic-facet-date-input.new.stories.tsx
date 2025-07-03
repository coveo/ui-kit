import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import type {AnyBindings} from '../../../interface/bindings';
import './atomic-facet-date-input';

// Wrap it in search interface
const {decorator, play} = wrapInSearchInterface();

// Mock bindings for the internal component
const mockBindings = {
  i18n: {
    t: (key: string, interpolations?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'Date Range': 'Date Range',
        start: 'Start date',
        end: 'End date',
        'date-input-start': `Enter a start date for ${interpolations?.label || 'Date Range'}`,
        'date-input-end': `Enter an end date for ${interpolations?.label || 'Date Range'}`,
        apply: 'Apply',
        'date-input-apply': `Apply custom start and end dates for ${interpolations?.label || 'Date Range'}`,
      };
      return translations[key] || key;
    },
  },
  store: {},
  engine: {},
} as AnyBindings;

const meta: Meta = {
  component: 'atomic-facet-date-input',
  title: 'AtomicFacetDateInput',
  id: 'atomic-facet-date-input',
  tags: ['internal'],
  render: () => html`
    <atomic-facet-date-input
      .bindings=${mockBindings}
      .facetId=${'test-facet'}
      .label=${'Date Range'}
      .rangeGetter=${() => undefined}
      .rangeSetter=${() => {}}
    ></atomic-facet-date-input>
  `,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-facet-date-input',
};
