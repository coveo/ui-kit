import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'atomic-quickview',
  {},
  {
    engineConfig: {
      preprocessRequest: (request) => {
        const fakeQuery = 'coveo intranet';
        if (
          request.headers &&
          request.headers['Content-Type'] === 'application/json'
        ) {
          const parsed = JSON.parse(request.body as string);
          parsed.aq = '@filetype=pdf';
          parsed.q = fakeQuery;
          request.body = JSON.stringify(parsed);
        }
        if (
          request.headers &&
          request.headers['Content-Type'] ===
            'application/x-www-form-urlencoded'
        ) {
          request.body = request.body.replace(
            'q=&',
            `q=${encodeURIComponent(fakeQuery)}&`
          );
        }
        return request;
      },
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/Quickview',
  id: 'atomic-quickview',
};
export const Default = exportedStory;
