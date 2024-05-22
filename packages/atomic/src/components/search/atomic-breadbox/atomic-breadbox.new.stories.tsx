import '@coveo/atomic/dist/atomic/atomic.esm.js';
import '@coveo/atomic/dist/atomic/themes/coveo.css';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import {userEvent, waitFor, expect} from '@storybook/test';
import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-breadbox',
  title: 'Atomic/Breadbox',
  id: 'atomic-breadbox',
  loaders: [async () => {}],
  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;
type Story = StoryObj;

export const FirstStory: Story = {
  name: 'atomic-breadbox',
  args: {},
  decorators: [
    (story) => html`
      ${story()}
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
        <atomic-facet
          field="filetype"
          style="flex-grow:1"
          label="File type"
        ></atomic-facet>
        <atomic-facet
          field="source"
          style="flex-grow:1"
          label="Source"
        ></atomic-facet>
      </div>
    `,
  ],
  play: async (context) => {
    await play(context);
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);
    await step('Wait for the facet values to render', async () => {
      await waitFor(
        () => expect(canvas.getByShadowTitle('People')).toBeInTheDocument(),
        {
          timeout: 30e3,
        }
      );
    });
    await step('Select a facet value', async () => {
      const facet = canvas.getByShadowTitle('People');
      await userEvent.click(facet);
      await waitFor(
        () =>
          expect(
            canvas.getByShadowTitle('Object type: People')
          ).toBeInTheDocument(),
        {timeout: 30e3}
      );
    });
  },
};
