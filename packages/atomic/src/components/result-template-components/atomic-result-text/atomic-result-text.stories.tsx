import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultTextDoc from './atomic-result-text.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultText',
  'atomic-result-text',
  {field: 'excerpt'},
  ResultTextDoc
);
export default defaultModuleExport;
export const DefaultResultText = exportedStory;
