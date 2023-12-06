import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Facet',
  'atomic-facet',
  {field: 'objecttype'},
  {
    additionalMarkup: () =>
      html`<style>
        atomic-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>`,
  }
);

export default {...defaultModuleExport, title: 'Atomic/Facet'};
export const Default = exportedStory;
