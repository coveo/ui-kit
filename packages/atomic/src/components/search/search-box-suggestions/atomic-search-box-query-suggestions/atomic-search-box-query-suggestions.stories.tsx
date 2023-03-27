import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox/QuerySuggestions',
  'atomic-search-box-query-suggestions',
  {},
  {
    parentElement: () => {
      return document.createElement('atomic-search-box');
    },
  }
);

export default defaultModuleExport;
export const DefaultQuerySuggestions = exportedStory;
