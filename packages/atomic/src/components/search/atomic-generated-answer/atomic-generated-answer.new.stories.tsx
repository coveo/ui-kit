import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const layoutDecorator: Decorator = (story) => html`
  <atomic-search-layout>
    <atomic-layout-section section="search">
      <atomic-search-box></atomic-search-box>
    </atomic-layout-section>
    <atomic-layout-section section="main">
      ${story()}
      <atomic-layout-section section="status">
        <atomic-query-summary></atomic-query-summary>
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-search-layout>
`;

const {decorator, play} = wrapInSearchInterface({
  accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  organizationId: 'searchuisamples',
  search: {
    pipeline: 'genqatest',
  },
  preprocessRequest: (request) => {
    const parsed = JSON.parse(request.body as string);
    parsed.q = 'how to resolve netflix connection with tivo';
    request.body = JSON.stringify(parsed);
    return request;
  },
});

const meta: Meta = {
  component: 'atomic-generated-answer',
  title: 'Atomic/GeneratedAnswer',
  id: 'atomic-generated-answer',
  render: renderComponent,
  decorators: [layoutDecorator, decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  render: () => html`<atomic-generated-answer></atomic-generated-answer>`,
};

export const DisableCitationAnchoring: Story = {
  name: 'Citation anchoring disabled',
  render: () => html`
    <atomic-generated-answer disable-citation-anchoring></atomic-generated-answer>
  `,
};
