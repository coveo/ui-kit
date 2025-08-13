import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-sort-dropdown',
  title: 'Search/SortDropdown',
  id: 'atomic-sort-dropdown',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-sort-dropdown',
  args: {
    'slots-default': `
      <atomic-sort-expression
        label="relevance"
        expression="relevancy"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="most-recent"
        expression="date descending"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="Price ascending"
        expression="sncost ascending"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="Price ascending & Most recent"
        expression="sncost ascending, date descending"
      ></atomic-sort-expression>
    `,
  },
};
