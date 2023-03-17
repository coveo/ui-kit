import defaultResultComponentStory from '../../../../../../../utils/atomic-storybook/.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultBadge',
  'atomic-result-badge',
  {field: 'filetype'}
);

export default defaultModuleExport;
export const DefaultResultBage = exportedStory;
