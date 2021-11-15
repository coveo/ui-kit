import defaultStory from '../../../.storybook/default-story';
import SortExpressionDoc from './atomic-sort-expression.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SortDropdown/SortExpression',
  'atomic-sort-expression',
  {label: 'Relevance', expression: 'relevancy'},
  SortExpressionDoc,
  {parentElement: () => document.createElement('atomic-sort-dropdown')}
);

export default defaultModuleExport;
export const DefaultSortExpression = exportedStory;
