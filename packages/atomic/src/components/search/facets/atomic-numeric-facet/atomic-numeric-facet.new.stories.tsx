import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@coveo/atomic-storybook-utils/common/facets-decorator';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInSearchInterface({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.aq = '@filetype==("YouTubeVideo")';
    r.body = JSON.stringify(parsed);
    return r;
  },
});

const meta: Meta = {
  component: 'atomic-numeric-facet',
  title: 'Atomic/NumericFacet',
  id: 'atomic-numeric-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    'attributes-number-of-values': {
      name: 'number-of-values',
      control: {type: 'number', min: 1},
    },
  },
  args: {
    'attributes-number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-numeric-facet',
  decorators: [facetDecorator],
  args: {
    'attributes-field': 'ytviewcount',
  },
};

export const WithDependsOn: Story = {
  name: 'atomic-numeric-facet-with-depends-on',
  tags: ['test'],
  decorators: [
    (story, context) =>
      html`<style>
          ${context.componentId},
          atomic-facet {
            max-width: 500px;
            margin: auto;
          }
        </style>
        <atomic-breadbox></atomic-breadbox>
        ${story({})}
        <atomic-facet
          field="filetype"
          label="File Type (Parent facet)"
        ></atomic-facet>`,
  ],
  argTypes: {
    'attributes-depends-on-filetype': {
      name: 'depends-on-filetype',
      control: {type: 'text'},
    },
  },
  args: {
    'attributes-label': 'YouTube View Count (Dependent facet)',
    'attributes-field': 'ytviewcount',
    'attributes-with-input': 'integer',
    'attributes-depends-on-filetype': 'YouTubeVideo',
  },
  play: async (context) => {
    const {canvasElement, step} = context;
    const canvas = within(canvasElement);
    await play(context);
    await step('Select YouTubeVideo in File Type facet', async () => {
      const button = await canvas.findByShadowLabelText(
        'Inclusion filter on YouTubeVideo',
        {
          exact: false,
        }
      );
      button.ariaChecked === 'false' ? button.click() : null;
    });
  },
};
