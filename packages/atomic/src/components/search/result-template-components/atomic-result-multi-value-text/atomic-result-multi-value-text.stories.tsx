import defaultResultComponentStory from 'atomic-storybook/default-result-component-story';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultMultiValue',
  'atomic-result-multi-value-text',
  {field: 'language'},
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const request = JSON.parse(r.body!.toString());
        request.cq =
          '@language=French @language=Portuguese @language=German @language=Arabic @language=Japanese @language=English';
        r.body = JSON.stringify(request);
        return r;
      },
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/ResultList/ResultMultiValue',
};
export const DefaultMultiValueText = exportedStory;
