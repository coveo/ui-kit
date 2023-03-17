import defaultResultComponentStory from '../../../../../../../utils/atomic-storybook/.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultLink',
  'atomic-result-link',
  {}
);

export default defaultModuleExport;
export const DefaultResultLink = exportedStory;
