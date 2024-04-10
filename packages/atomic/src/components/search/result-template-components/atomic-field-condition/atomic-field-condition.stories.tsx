import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-field-condition',
  {},
  {
    additionalChildMarkup: () => html`
      <div>
        The visibility of this text can be controlled by the field conditions
        component
      </div>
    `,
    additionalMarkup: () => html`
      <div style="margin:20px 0">
        Select facet value(s) to filter on field values and influence the
        condition(s).
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
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/FieldCondition',
  id: 'atomic-field-condition',
};
export const Default = exportedStory;
