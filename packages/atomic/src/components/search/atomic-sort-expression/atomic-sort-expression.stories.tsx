import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SortDropdown/SortExpression',
  'atomic-sort-expression',
  {label: 'Relevance', expression: 'relevancy'},
  {
    parentElement: () => {
      return document.createElement('atomic-sort-dropdown');
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/SortDropdown/SortExpression',
};
export const DefaultSortExpression = exportedStory;
