import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SortDropdown/SortExpression',
  'atomic-sort-expression',
  {label: 'Relevance', expression: 'relevancy'},
  {parentElement: () => document.createElement('atomic-sort-dropdown')}
);

export default defaultModuleExport;
export const DefaultSortExpression = exportedStory;
