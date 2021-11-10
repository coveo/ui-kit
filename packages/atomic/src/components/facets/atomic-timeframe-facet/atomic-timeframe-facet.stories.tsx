import {html} from 'lit-html';
import defaultStory from '../../../../.storybook/default-story';
import TimeframeFacetDoc from './atomic-timeframe-facet.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/TimeframeFacet',
  'atomic-timeframe-facet',
  {
    unit: 'year',
  },
  TimeframeFacetDoc,
  {
    additionalMarkup: () => html`
      <style>
        atomic-timeframe-facet {
          max-width: 500px;
          margin: auto;
        }
      </style>
    `,
    additionalChildMarkup: () => html`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,
  }
);

export default defaultModuleExport;
export const DefaultTimeframeFacet = exportedStory;
