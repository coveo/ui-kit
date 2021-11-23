import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultImageDoc from './atomic-result-image.mdx';

// TODO: This will require KIT-1178 to actually be usable properly
const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultImage',
  'atomic-result-image',
  {
    field: 'randomimage',
  },
  ResultImageDoc,
  {
    engineConfig: {
      search: {
        preprocessSearchResponseMiddleware: (res) => {
          res.body.results.forEach(
            (r) => (r.raw['randomimage'] = 'https://picsum.photos/200')
          );
          return res;
        },
      },
    },
  }
);
export default defaultModuleExport;
export const DefaultResultImage = exportedStory;
