import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet',
  'atomic-numeric-facet',
  {field: 'ytviewcount'},
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
