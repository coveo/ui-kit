import {html} from 'lit-html';
import defaultStory from '../../../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox/RecentQueries',
  'atomic-search-box-recent-queries',
  {},
  {
    parentElement: () => {
      return document.createElement('atomic-search-box');
    },
    additionalMarkup: () => {
      return html`<p>
        Type something and submit the query to see recent queries appears as
        suggestions
      </p>`;
    },
  }
);

export default defaultModuleExport;
export const DefaultRecentQueries = exportedStory;
