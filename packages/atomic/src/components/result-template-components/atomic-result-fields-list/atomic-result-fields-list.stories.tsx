import {html} from 'lit-html';
import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultFieldsList',
  'atomic-result-fields-list',
  {},
  {
    additionalChildMarkup: () => html`
      <style>
        .field {
          display: inline-flex;
          white-space: nowrap;
          align-items: center;
        }
        .field-label {
          font-weight: bold;
          margin-right: 0.25rem;
        }
      </style>
      <atomic-field-condition class="field" if-defined="author">
        <span class="field-label"
          ><atomic-text value="author"></atomic-text>:</span
        >
        <atomic-result-text field="author"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="source">
        <span class="field-label"
          ><atomic-text value="source"></atomic-text>:</span
        >
        <atomic-result-text field="source"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="language">
        <span class="field-label"
          ><atomic-text value="language"></atomic-text>:</span
        >
        <atomic-result-multi-value-text
          field="language"
        ></atomic-result-multi-value-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="filetype">
        <span class="field-label"
          ><atomic-text value="fileType"></atomic-text>:</span
        >
        <atomic-result-text field="filetype"></atomic-result-text>
      </atomic-field-condition>

      <atomic-field-condition class="field" if-defined="sncost">
        <span class="field-label">Cost:</span>
        <atomic-result-number field="sncost">
          <atomic-format-currency currency="CAD"></atomic-format-currency>
        </atomic-result-number>
      </atomic-field-condition>

      <span class="field">
        <span class="field-label">Date:</span>
        <atomic-result-date></atomic-result-date>
      </span>
    `,
  }
);

export default defaultModuleExport;
export const DefaultResultFieldsList = exportedStory;
