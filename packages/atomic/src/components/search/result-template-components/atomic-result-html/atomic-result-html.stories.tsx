import {defaultResultComponentStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultHtml',
  'atomic-result-html',
  {field: 'excerpt'}
);
export default defaultModuleExport;
export const DefaultResultHtml = exportedStory;
