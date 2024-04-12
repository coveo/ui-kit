import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-result-rating',
  {field: 'snrating'},
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.aq = '@snrating';
        parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'snrating'];
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultRating',
  id: 'atomic-result-rating',
};
export const Default = exportedStory;
