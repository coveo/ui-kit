import defaultStory from '../../../.storybook/default-story';
import SearchboxDoc from './atomic-search-box.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Searchbox',
  'atomic-search-box',
  {},
  SearchboxDoc
);

export default defaultModuleExport;
export const DefaultSearchbox = exportedStory;
