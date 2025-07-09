import {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.query = 'runing shoes';
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const meta: Meta = {
  component: 'atomic-commerce-did-you-mean',
  title: 'Commerce/atomic-commerce-did-you-mean',
  id: 'atomic-commerce-did-you-mean',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};
