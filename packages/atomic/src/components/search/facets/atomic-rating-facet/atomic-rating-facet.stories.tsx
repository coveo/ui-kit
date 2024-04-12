import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-rating-facet',
  {field: 'snrating'},
  {
    additionalMarkup: () =>
      html`<style>
        atomic-rating-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>`,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/RatingFacet',
  id: 'atomic-rating-facet',
};
export const Default = exportedStory;
