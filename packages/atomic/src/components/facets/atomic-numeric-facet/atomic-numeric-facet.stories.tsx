import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';
import NumericFacetDoc from './atomic-numeric-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet',
  'atomic-numeric-facet',
  {field: 'ytviewcount'},
  NumericFacetDoc,
  {
    additionalMarkup: () => html`<style>
      atomic-numeric-facet {
        max-width: 500px;
        margin: auto;
      }
    </style>`,
  }
);

export default defaultModuleExport;
export const DefaultNumericFacet = exportedStory;
