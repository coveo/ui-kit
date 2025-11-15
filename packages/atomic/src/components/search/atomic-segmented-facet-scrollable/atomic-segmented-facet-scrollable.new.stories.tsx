import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();

const withNarrowContainer: Decorator = (story) => {
  return html` <div style="width: 400px; border: 1px solid lightgray; padding: 8px;">
    ${story()}
  </div>`;
};

const meta: Meta = {
  component: 'atomic-segmented-facet-scrollable',
  title: 'Search/SegmentedFacetScrollable',
  id: 'atomic-segmented-facet-scrollable',
  render: () => html`
    <atomic-segmented-facet-scrollable>
      <atomic-segmented-facet
        field="objecttype"
        label="Object Type"
      ></atomic-segmented-facet>
    </atomic-segmented-facet-scrollable>
  `,
  decorators: [decorator, withNarrowContainer],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-segmented-facet-scrollable',
};
