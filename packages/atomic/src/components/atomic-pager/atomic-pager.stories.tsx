import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Pager',
  'atomic-pager',
  {}
);

export default defaultModuleExport;
export const DefaultPager = exportedStory;
