import {expect, userEvent, waitFor} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-breadbox',
  title: 'Atomic/Breadbox',
  id: 'atomic-breadbox',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-breadbox',
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

export const WithRatingFacet: Story = {
  name: 'atomic-breadbox with rating facet',
  decorators: [
    (story) => html`
      ${story()}
      <div style="margin:20px 0">
        Select a rating facet value to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-rating-facet
          field="snrating"
          label="Rating"
          number-of-intervals="5"
        >
        </atomic-rating-facet>
      </div>
    `,
  ],
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  decorators: [
    (story) => html`
      ${story()}
      <div style="display: flex; justify-content: flex-start;">
        <atomic-facet
          field="objecttype"
          style="flex-grow:1"
          label="Object type"
        ></atomic-facet>
      </div>
    `,
  ],
  play: async (context) => {
    await play(context);
    const canvas = within(context.canvasElement);
    await waitFor(
      () => expect(canvas.getByShadowTitle('People')).toBeInTheDocument(),
      {timeout: 30e3}
    );
    await userEvent.click(canvas.getByShadowTitle('People'));
    await waitFor(
      () =>
        expect(
          canvas.getByShadowTitle('Object type: People')
        ).toBeInTheDocument(),
      {timeout: 30e3}
    );
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const clearButton = await context.canvas.findByShadowLabelText(
          'Clear',
          {exact: false}
        );
        clearButton.click();
      },
      expectedText: /results/i,
      timeout: 10000,
    });
  },
};
