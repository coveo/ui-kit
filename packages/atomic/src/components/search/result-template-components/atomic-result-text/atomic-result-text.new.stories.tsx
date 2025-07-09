import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results.forEach((r) => {
        r.excerpt = 'Some Text content';
      });
      return res;
    },
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-text',
  title: 'Atomic/ResultList/ResultText',
  id: 'atomic-result-text',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-text',
  args: {field: 'excerpt'},
};
