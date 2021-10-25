import defaultStory from '../../../.storybook/default-story';
import BreadboxDoc from './atomic-breadbox';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Breadbox',
  'atomic-breadbox',
  {},
  BreadboxDoc
);

export default defaultModuleExport;
export const DefaultBreadbox = exportedStory;
