import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';

// TODO: This will require KIT-1178 to actually be usable properly
const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultImage',
  'atomic-result-image',
  {
    field: 'randomimage',
  },
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
