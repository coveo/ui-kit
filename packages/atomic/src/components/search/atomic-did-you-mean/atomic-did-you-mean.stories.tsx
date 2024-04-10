import defaultStory from 'atomic-storybook/default-story';

// cSpell:ignore testt
const id = 'atomic-did-you-mean';
const {defaultModuleExport, exportedStory} = defaultStory(
  id,
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

export default {...defaultModuleExport, title: 'Atomic/DidYouMean'};
export const Default = exportedStory;
