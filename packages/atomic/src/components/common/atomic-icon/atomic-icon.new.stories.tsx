import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import bgIcons from '@salesforce-ux/design-system/design-tokens/dist/bg-standard.common';
import {userEvent, waitFor, expect} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import AssetsList from '../../../../docs/assets.json';

function snakeToCamel(value: string) {
  return value
    .toLowerCase()
    .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-icon',
  title: 'Atomic/Icon',
  id: 'atomic-icon',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    'attributes-icon': {
      name: 'icon',
      options: AssetsList.assets,
      mapping: AssetsList.assets.reduce<Record<string, string>>(
        (acc, asset) => {
          acc[asset] = `assets://${asset}`;
          return acc;
        },
        {}
      ),
      control: {type: 'select'},
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-icon',
  args: {
    'attributes-icon': 'assets://account.svg',
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

export const AllIcons: Story = {
  name: 'All available icons',
  argTypes: {
    'attributes-icon': {
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
