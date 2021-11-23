import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';
import TimeframeDoc from './atomic-timeframe.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/TimeframeFacet/Timeframe',
  'atomic-timeframe',
  {unit: 'year'},
  TimeframeDoc,
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
