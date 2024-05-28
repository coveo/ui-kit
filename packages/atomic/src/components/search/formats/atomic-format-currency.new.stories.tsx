import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const request = JSON.parse(r.body!.toString());
    request.cq = '@sncost>0';
    request.fieldsToInclude = ['sncost'];
    request.numberOfResults = 1;
    r.body = JSON.stringify(request);
    return r;
  },
});

const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-format-currency',
  title: 'Atomic/Format/atomic-format-currency',
  id: 'atomic-format-currency',

  render: renderComponent,
  decorators: [searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Facet: Story = {
  name: 'Within Numeric Facet',
  decorators: [
    (story) => html`
      <atomic-numeric-facet field="sncost"> ${story()} </atomic-numeric-facet>
    `,
  ],
  args: {
    currency: 'USD',
  },
};

export const Result: Story = {
  name: 'Within Numeric Result',
  decorators: [
    (story) => html`
      <atomic-result-number field="sncost"> ${story()} </atomic-result-number>
    `,
    resultDecorator,
  ],
  args: {
    currency: 'USD',
  },
};
