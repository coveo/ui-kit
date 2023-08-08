import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox/QuerySuggestions',
  'atomic-search-box-query-suggestions',
  {},
  {
    parentElement: function () {
      return document.createElement('atomic-search-box');
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/Searchbox/QuerySuggestions',
};
export const DefaultQuerySuggestions = exportedStory;
