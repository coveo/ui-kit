import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-sort-expression',
  {label: 'Relevance', expression: 'relevancy'},
  {
    parentElement: function () {
      return document.createElement('atomic-sort-dropdown');
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/SortDropdown/SortExpression',
};
export const Default = exportedStory;
