import defaultStory from '../../../.storybook/default-story';
import PagerDoc from './atomic-pager.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Pager',
  'atomic-pager',
  {},
  PagerDoc
);

export default defaultModuleExport;
export const DefaultPager = exportedStory;
