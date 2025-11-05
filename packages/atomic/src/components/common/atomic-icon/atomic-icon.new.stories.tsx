import bgIcons from '@salesforce-ux/design-system/design-tokens/dist/bg-standard.common';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {expect, userEvent, waitFor} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import AssetsList from '../../../../docs/assets.json';

function snakeToCamel(value: string) {
  return value
    .toLowerCase()
    .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-icon', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-icon',
  title: 'Common/Icon',
  id: 'atomic-icon',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
  //TODO: Investigate https://coveord.atlassian.net/browse/KIT-5112
  tags: ['!test'],
};

export default meta;
//TODO here
export const Default: Story = {
  args: {
    icon: 'assets://account.svg',
  },
  decorators: [
    (story) =>
      html` <style>
          atomic-icon {
            background-color: black;
            width: 100px;
            height: 100px;
          }
        </style>
        ${story()}`,
  ],
  play: async (context) => {
    await play(context);
    const {canvas, step} = context;
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

export const AllIcons: Story = {
  name: 'All available icons',
  argTypes: {
    icon: {
      name: 'icon',
      control: {
        disable: true,
      },
      table: {
        disable: true,
      },
    },
  },
  args: {},
  decorators: [
    () =>
      html` <style>
          atomic-icon {
            background-color: black;
            width: 100px;
            height: 100px;
          }
          .assets-container {
            margin: 20px 0px;
            border-top: 2px dashed black;
            padding-top: 20px;
          }
          .asset-container {
            text-align: center;
          }
          .assets-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 2rem;
            margin-top: 20px;
          }
          .asset-reference {
            font-weight: bold;
            word-break: break-all;
            font-size: 12px;
          }
        </style>
        <div class="assets-container">
          All available assets:

          <div class="assets-grid">
            ${AssetsList.assets.map((asset) => {
              const assetReference = `assets://${asset}`;
              const backgroundColor =
                bgIcons[snakeToCamel(asset.replace('.svg', ''))] ||
                'transparent';
              return html`<div class="asset-container">
                <div>
                  <atomic-icon
                    icon="${assetReference}"
                    style="background-color:${backgroundColor};"
                  ></atomic-icon>
                </div>
                <div>
                  ${asset}
                  <div class="asset-reference">(${assetReference})</div>
                </div>
              </div>`;
            })}
          </div>
        </div>`,
  ],
};
