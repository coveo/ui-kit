import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-numeric-facet',
  {field: 'ytviewcount'},
  {
    additionalMarkup: () =>
      html`<style>
        atomic-numeric-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>`,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/NumericFacet',
  id: 'atomic-numeric-facet',
};
export const Default = exportedStory;
