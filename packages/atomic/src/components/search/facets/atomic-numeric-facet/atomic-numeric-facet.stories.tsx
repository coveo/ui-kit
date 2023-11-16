import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet',
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

export default {...defaultModuleExport, title: 'Atomic/NumericFacet'};
export const Default = exportedStory;
