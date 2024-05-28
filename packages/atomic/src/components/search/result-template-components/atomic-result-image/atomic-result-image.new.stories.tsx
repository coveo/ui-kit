import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results.forEach(
        (r) => (r.raw['randomimage'] = 'https://picsum.photos/200')
      );
      return res;
    },
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-image',
  title: 'Atomic/ResultList/ResultImage',
  id: 'atomic-result-image',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-image',
  args: {
    field: 'randomimage',
  },
};
