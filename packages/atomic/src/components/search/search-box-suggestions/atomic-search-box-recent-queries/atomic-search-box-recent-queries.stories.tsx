import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-search-box-recent-queries',
  {},
  {
    parentElement: function () {
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

export default {
  ...defaultModuleExport,
  title: 'Atomic/SearchBox/RecentQueries',
  id: 'atomic-search-box-recent-queries',
};
export const Default = exportedStory;
