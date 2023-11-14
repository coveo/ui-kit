import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/CategoryFacet',
  'atomic-category-facet',
  {field: 'geographicalhierarchy'},
  {
    additionalMarkup: () =>
      html`<style>
        atomic-category-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>`,
  }
);
export default {...defaultModuleExport};
export const Default = exportedStory;
