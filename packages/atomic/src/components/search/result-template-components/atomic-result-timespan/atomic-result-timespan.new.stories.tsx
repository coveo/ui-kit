import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const request = JSON.parse(r.body!.toString());
    request.cq = '@ytvideoduration';
    request.fieldsToInclude = ['ytvideoduration'];
    request.numberOfResults = 1;
    r.body = JSON.stringify(request);
    return r;
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-timespan',
  title: 'Atomic/ResultList/ResultTimespan',
  id: 'atomic-result-timespan',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'atomic-result-timespan',
  args: {field: 'ytvideoduration', unit: 's'},
};