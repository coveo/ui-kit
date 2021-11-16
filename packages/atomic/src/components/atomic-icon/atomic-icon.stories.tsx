import {html} from 'lit-html';
import defaultStory from '../../../.storybook/default-story';
import IconDoc from './atomic-icon.mdx';
import AssetsList from '../../../docs/assets.json';
import bgIcons from '@salesforce-ux/design-system/design-tokens/dist/bg-standard.common';

function snakeToCamel(value: string) {
  return value
    .toLowerCase()
    .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Icon',
  'atomic-icon',
  {
    icon: 'assets://account.svg',
  },
  IconDoc,
  {
    additionalMarkup: () => {
      return html`
        <style>
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
              return html`<div>
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
        </div>
      `;
    },
  }
);

export default defaultModuleExport;
export const DefaultIcon = exportedStory;
