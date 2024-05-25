import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-format-unit',
  title: 'Atomic/Format/atomic-format-unit',
  id: 'atomic-format-unit',

  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
  args: {unit: 'byte'},
};

export default meta;
type Story = StoryObj;

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
      <style>
        atomic-numeric-facet {
          display: none;
        }
      </style>
      <atomic-numeric-facet field="size"></atomic-numeric-facet>
      <atomic-result-number field="size"> ${story()} </atomic-result-number>
    `,
  ],
};
