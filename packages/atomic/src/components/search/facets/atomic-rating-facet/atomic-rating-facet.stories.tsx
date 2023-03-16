import {defaultStory} from '@coveo/atomic-storybook';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/RatingFacet',
  'atomic-rating-facet',
  {field: 'snrating'},
  {
    additionalMarkup: () => html`<style>
      atomic-rating-facet {
        max-width: 500px;
        margin: auto;
      }
    </style>`,
  }
);

export default defaultModuleExport;
export const DefaultRatingFacet = exportedStory;
