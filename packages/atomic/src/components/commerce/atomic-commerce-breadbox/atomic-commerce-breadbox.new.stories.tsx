import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {userEvent, waitFor, expect} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});
const meta: Meta = {
  component: 'atomic-commerce-breadbox',
  title: 'Atomic-commerce/Breadbox',
  id: 'atomic-commerce-breadbox',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-breadbox',
  decorators: [
    (story) => html`
      ${story()}
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-commerce-facets> </atomic-commerce-facets>
      </div>
    `,
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
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
