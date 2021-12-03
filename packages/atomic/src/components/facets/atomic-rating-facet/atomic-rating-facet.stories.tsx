import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';

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
