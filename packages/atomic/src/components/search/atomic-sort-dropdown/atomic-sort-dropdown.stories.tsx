import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SortDropdown',
  'atomic-sort-dropdown',
  {},
  {
    additionalChildMarkup: () => html`
      <atomic-sort-expression
        label="relevance"
        expression="relevancy"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="most-recent"
        expression="date descending"
      ></atomic-sort-expression>
    `,
  }
);

export default {...defaultModuleExport, title: 'Atomic/SortDropdown'};
export const Default = exportedStory;
