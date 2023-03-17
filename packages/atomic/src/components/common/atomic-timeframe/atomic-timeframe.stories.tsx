import {html} from 'lit-html';
import defaultStory from '../../../../../../utils/atomic-storybook/.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/TimeframeFacet/Timeframe',
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
    parentElement: () => {
      return document.createElement('atomic-timeframe-facet');
    },
  }
);

export default defaultModuleExport;
export const DefaultTimeframe = exportedStory;
