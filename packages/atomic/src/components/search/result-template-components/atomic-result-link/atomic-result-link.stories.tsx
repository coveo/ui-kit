import {defaultResultComponentStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultLink',
  'atomic-result-link',
  {}
);

export default defaultModuleExport;
export const DefaultResultLink = exportedStory;
