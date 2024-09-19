import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInResult} from '@coveo/atomic-storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (request) => {
    const fakeQuery = 'test';
    switch (
      (request.headers as Record<string, string> | undefined)?.['Content-Type']
    ) {
      case 'application/json': {
        const parsed = JSON.parse(request.body as string);
        parsed.aq = '@filetype=pdf';
        parsed.q = fakeQuery;
        parsed.numberOfResults = 1;
        request.body = JSON.stringify(parsed);
        break;
      }
      case 'application/x-www-form-urlencoded':
        if (!request.body) {
          break;
        }
        request.body = (request.body as string).replace(
          'q=&',
          `q=${encodeURIComponent(fakeQuery)}&`
        );
        break;
    }
    return request;
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-quickview',
  title: 'Atomic/ResultList/Quickview',
  id: 'atomic-quickview',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-quick-view',
};
