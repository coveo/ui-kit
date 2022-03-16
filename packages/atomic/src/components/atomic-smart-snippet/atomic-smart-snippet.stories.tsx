import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SmartSnippet',
  'atomic-smart-snippet',
  {},
  {
    engineConfig: {
      search: {
        preprocessSearchResponseMiddleware: (r) => {
          const [result] = r.body.results;
          result.title = 'Manage the Coveo In-Product Experiences (IPX)';
          result.clickUri = 'https://docs.coveo.com/en/3160';
          r.body.questionAnswer = {
            documentId: {
              contentIdKey: 'permanentid',
              contentIdValue: result.raw.permanentid,
            },
            question: 'Creating an In-Product Experience (IPX)',
            answerSnippet: `
              <ol>
                <li>On the <b>In-Product Experiences</b> page, click Add <b>In-Product Experience</b>.</li>
                <li>In the Configuration tab, fill the Basic settings section.</li>
                <li>(Optional) Use the Design and Content access tabs to customize your <b>IPX</b> interface.</li>
                <li>Click Save.</li>
                <li>In the Loader snippet panel that appears, you may click Copy to save the loader snippet for your <b>IPX</b> to your clipboard, and then click Save.  You can Always retrieve the loader snippet later.</li>
              </ol>
              
              <p>
                You're now ready to load your IPX interface in the desired web site or application. However, we recommend that you configure query pipelines for your IPX interface before.
              </p>
            `,
            relatedQuestions: [],
            score: 1337,
          };
          return r;
        },
      },
    },
  }
);

export default defaultModuleExport;
export const DefaultSmartSnippet = exportedStory;
