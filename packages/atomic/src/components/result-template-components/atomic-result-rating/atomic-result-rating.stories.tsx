import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultRating',
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

export default defaultModuleExport;
export const DefaultResultRating = exportedStory;
