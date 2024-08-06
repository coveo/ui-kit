import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/search/result-wrapper';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const request = JSON.parse(r.body!.toString());
    request.cq = '@size>0';
    request.fieldsToInclude = ['size'];
    request.numberOfResults = 1;
    r.body = JSON.stringify(request);
    return r;
  },
});

const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-format-unit',
  title: 'Atomic/Format/atomic-format-unit',
  id: 'atomic-format-unit',

  render: renderComponent,
  decorators: [searchInterfaceDecorator],
  parameters,
  play,
  args: {unit: 'byte'},
};

export default meta;

export const Facet: Story = {
  name: 'Within Numeric Facet',
  decorators: [
    (story) => html`
      <atomic-numeric-facet field="size"> ${story()} </atomic-numeric-facet>
    `,
  ],
};

export const Result: Story = {
  name: 'Within Numeric Result',
  decorators: [
    (story) => html`
      <atomic-result-number field="size"> ${story()} </atomic-result-number>
    `,
    resultDecorator,
  ],
};
