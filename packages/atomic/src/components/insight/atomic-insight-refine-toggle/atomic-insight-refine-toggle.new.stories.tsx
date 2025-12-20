import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface({
  search: {
    preprocessRequest: (request) => {
      request.tab = 'All';
      request.locale = 'en-US';
      return request;
    },
  },
});
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
  },
  args,
  argTypes,

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
