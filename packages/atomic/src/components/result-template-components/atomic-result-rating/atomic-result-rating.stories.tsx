import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultRatingDoc from './atomic-result-rating.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultRating',
  'atomic-result-rating',
  {field: 'snrating'},
  ResultRatingDoc,
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
