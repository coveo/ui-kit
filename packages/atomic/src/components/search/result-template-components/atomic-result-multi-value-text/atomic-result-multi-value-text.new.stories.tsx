import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInResult} from '@coveo/atomic-storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const request = JSON.parse(r.body!.toString());
    request.cq =
      '@language=French @language=Portuguese @language=German @language=Arabic @language=Japanese @language=English';
    r.body = JSON.stringify(request);
    return r;
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-multi-value-text',
  title: 'Atomic/ResultList/ResultMultiValueText',
  id: 'atomic-result-multi-value-text',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-multi-value-text',
  args: {field: 'language'},
};
