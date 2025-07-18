import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import './atomic-facet-date-input';

// Wrap it in search interface
const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-facet-date-input',
  title: 'AtomicFacetDateInput',
  id: 'atomic-facet-date-input',
  tags: ['internal'],
  render: () => html`
    <atomic-facet-date-input
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
