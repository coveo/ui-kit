import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-timeframe',
  {unit: 'year'},
  {
    additionalMarkup: () => html`
      <style>
        atomic-timeframe-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>
    `,
    parentElement: function () {
      return document.createElement('atomic-timeframe-facet');
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/TimeframeFacet/Timeframe',
};
export const Default = exportedStory;
