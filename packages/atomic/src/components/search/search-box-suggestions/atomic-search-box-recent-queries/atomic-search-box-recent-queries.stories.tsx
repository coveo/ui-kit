import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SearchBox/RecentQueries',
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
};
export const Default = exportedStory;
