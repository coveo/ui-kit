import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Pager',
  'atomic-pager',
  {}
);

export default defaultModuleExport;
export const DefaultPager = exportedStory;
