import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultBadgeDocumentation from './atomic-result-badge.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultBadge',
  'atomic-result-badge',
  {field: 'filetype'},
  ResultBadgeDocumentation
);

export default defaultModuleExport;
export const DefaultResultBage = exportedStory;
