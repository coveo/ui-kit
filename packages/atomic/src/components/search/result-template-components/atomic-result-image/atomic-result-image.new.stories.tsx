import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results.forEach((r) => {
        r.raw.randomimage = 'https://picsum.photos/200';
        r.raw.someAltField = 'Some alt value';
      });
      return res;
    },
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-image',
  title: 'Search/ResultList/ResultImage',
  id: 'atomic-result-image',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-image',
  args: {
    'attributes-field': 'randomimage',
  },
};

export const withAnAltTextField: Story = {
  name: 'With an alt text field',
  args: {
    'attributes-field': 'invalid',
    'attributes-fallback': 'invalid',
    'attributes-image-alt-field': 'someAltField',
  },
};
