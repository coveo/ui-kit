import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/RatingRangeFacet',
  'atomic-rating-range-facet',
  {field: 'snrating'},
  {
    additionalMarkup: () => html`<style>
      atomic-rating-range-facet {
        max-width: 500px;
        margin: auto;
      }
    </style>`,
  }
);
export default defaultModuleExport;
export const DefaultRatingRangeFacet = exportedStory;
