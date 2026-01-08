import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock.js';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/insight/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-refine-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-refine-toggle',
  title: 'Insight/RefineToggle',
  id: 'atomic-insight-refine-toggle',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  play,
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) => html`
      ${story()}
      <div style="display:none;">
        <atomic-insight-facet field="author" label="Authors"></atomic-insight-facet>
        <atomic-insight-facet field="language" label="Language"></atomic-insight-facet>
        <atomic-insight-facet
          field="objecttype"
          label="Type"
        ></atomic-insight-facet>
      </div>
    `,
    decorator,
  ],
};
