import {defaultStory} from '@coveo/atomic-storybook';

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
