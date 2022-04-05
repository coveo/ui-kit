import {html} from 'lit-html';
import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/ResultList',
  'atomic-folded-result-list',
  {},
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.aq = '@source==("iNaturalistTaxons")';
        parsed.fieldsToInclude = [...(parsed.fieldsToInclude || []), 'source'];
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
    additionalChildMarkup: () => html`
      <atomic-result-template>
        <template>
          <atomic-result-link></atomic-result-link>
          <div style="padding-left: 15px; margin-top: 20px;">
            <atomic-result-children>
              <b slot="before-children">Related:</b>
              <atomic-result-children-template>
                <template>
                  <atomic-result-link></atomic-result-link>
                </template>
              </atomic-result-children-template>
            </atomic-result-children>
          </div>
        </template>
      </atomic-result-template>
    `,
  }
);

export default defaultModuleExport;
export const DefaultFoldedResultList = exportedStory;
