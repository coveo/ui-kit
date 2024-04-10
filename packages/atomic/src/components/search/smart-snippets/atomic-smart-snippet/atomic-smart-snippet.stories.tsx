import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
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
              contentIdValue: result.raw.permanentid!,
            },
            question: 'Creating an In-Product Experience (IPX)',
            answerSnippet: `
              <ol>
                <li>On the <a href="https://platform.cloud.coveo.com/admin/#/orgid/search/in-app-widgets/">In-Product Experiences</a> page, click Add <b>In-Product Experience</b>.</li>
                <li>In the Configuration tab, fill the Basic settings section.</li>
                <li>(Optional) Use the Design and Content access tabs to <a href="https://docs.coveo.com/en/3160/#customizing-an-ipx-interface">customize your <b>IPX</b> interface</a>.</li>
                <li>Click Save.</li>
                <li>In the Loader snippet panel that appears, you may click Copy to save the loader snippet for your <b>IPX</b> to your clipboard, and then click Save.  You can Always retrieve the loader snippet later.</li>
              </ol>
              
              <p>
                You're now ready to <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#embed-your-ipx-interface-in-sites-and-applications">embed your IPX interface</a>. However, we recommend that you <a href="https://docs.coveo.com/en/3160/build-a-search-ui/manage-coveo-in-product-experiences-ipx#configuring-query-pipelines-for-an-ipx-interface-recommended">configure query pipelines for your IPX interface</a> before.
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

export default {
  ...defaultModuleExport,
  title: 'Atomic/SmartSnippet',
  id: 'atomic-smart-snippet',
};
export const Default = exportedStory;
