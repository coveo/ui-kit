import defaultStory from 'atomic-storybook/default-story';

// cSpell:ignore testt

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-did-you-mean',
  {},
  {
    engineConfig: {
      preprocessRequest: (r) => {
        const parsed = JSON.parse(r.body as string);
        parsed.q = 'testt';
        r.body = JSON.stringify(parsed);
        return r;
      },
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/DidYouMean',
  id: 'atomic-did-you-mean',
};
export const Default = exportedStory;
