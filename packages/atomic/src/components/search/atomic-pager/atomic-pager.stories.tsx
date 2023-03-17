import defaultStory from '../../../../../../utils/atomic-storybook/.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Pager',
  'atomic-pager',
  {}
);

export default defaultModuleExport;
export const DefaultPager = exportedStory;
