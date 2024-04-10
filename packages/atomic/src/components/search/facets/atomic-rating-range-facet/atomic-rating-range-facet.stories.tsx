import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-rating-range-facet',
  {field: 'snrating'},
  {
    additionalMarkup: () =>
      html`<style>
        atomic-rating-range-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>`,
  }
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/RatingRangeFacet',
  id: 'atomic-rating-range-facet',
};
export const Default = exportedStory;
