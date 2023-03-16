import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox',
  'atomic-search-box',
  {}
);

export default defaultModuleExport;
export const DefaultSearchbox = exportedStory;
