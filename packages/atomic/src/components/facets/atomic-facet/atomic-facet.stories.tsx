import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';
import FacetDoc from './atomic-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Facet',
  'atomic-facet',
  {field: 'objecttype'},
  FacetDoc,
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
