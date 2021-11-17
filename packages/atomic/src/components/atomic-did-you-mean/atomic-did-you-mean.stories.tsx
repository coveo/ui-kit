import defaultStory from '../../../.storybook/default-story';
import DidYouMeanDoc from './atomic-did-you-mean.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/DidYouMean',
  'atomic-did-you-mean',
  {},
  DidYouMeanDoc,
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

export default defaultModuleExport;
export const DefaultDidYouMean = exportedStory;
