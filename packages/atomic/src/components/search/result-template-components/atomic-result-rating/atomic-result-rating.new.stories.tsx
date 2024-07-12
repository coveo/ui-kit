import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.aq = '@snrating';
    parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'snrating'];
    parsed.numberOfResults = 1;
    r.body = JSON.stringify(parsed);
    return r;
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-rating',
  title: 'Atomic/ResultList/ResultRating',
  id: 'atomic-result-rating',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-rating',
  args: {'attributes-field': 'snrating'},
};
