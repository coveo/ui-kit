import {defaultStory} from '@coveo/atomic-storybook';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Facet',
  'atomic-facet',
  {field: 'objecttype'},
  {
    additionalMarkup: () => html`<style>
      atomic-facet {
        max-width: 500px;
        margin: auto;
      }
    </style>`,
  }
);

export default defaultModuleExport;
export const DefaultFacet = exportedStory;
