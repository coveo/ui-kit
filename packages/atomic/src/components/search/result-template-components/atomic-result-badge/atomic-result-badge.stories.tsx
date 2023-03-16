import {defaultResultComponentStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultBadge',
  'atomic-result-badge',
  {field: 'filetype'}
);

export default defaultModuleExport;
export const DefaultResultBage = exportedStory;
