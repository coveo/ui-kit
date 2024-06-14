import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'size'];
    parsed.numberOfResults = 1;
    r.body = JSON.stringify(parsed);
    return r;
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-number',
  title: 'Atomic/ResultList/ResultNumber',
  id: 'atomic-result-number',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-number',
  args: {
    'slots-default': `
      <span style="font-weight: bold; margin-right: 0.25rem;">File size:</span>
      <atomic-format-unit unit="byte" unit-display="long"></atomic-format-unit>
    `,
    field: 'size',
  },
};
