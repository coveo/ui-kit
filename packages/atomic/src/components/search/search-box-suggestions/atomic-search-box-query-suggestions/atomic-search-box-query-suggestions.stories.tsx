import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SearchBox/QuerySuggestions',
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
  title: 'Atomic/SearchBox/QuerySuggestions',
};

export const Default = exportedStory;
