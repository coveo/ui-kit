import {html} from 'lit-html';
import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import FieldConditionDoc from './atomic-field-condition.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/FieldCondition',
  'atomic-field-condition',
  {},
  FieldConditionDoc,
  {
    additionalChildMarkup: () =>
      html`
        <div>
          The visibility of this text can be controlled by the field conditions
          component
        </div>
      `,
    additionalMarkup: () =>
      html`
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

export default defaultModuleExport;
export const DefaultFieldCondition = exportedStory;
