import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/SmartSnippetSuggestions',
  'atomic-smart-snippet-suggestions',
  {},
  {
    engineConfig: {
      search: {
        preprocessSearchResponseMiddleware: (r) => {
          r.body.results = [
            {
              title: 'Nurse Sharks',
              uri: 'https://www.inaturalist.org/taxa/49968',
              printableUri: 'https://www.inaturalist.org/taxa/49968',
              clickUri: 'https://www.inaturalist.org/taxa/49968',
              uniqueId: '42.29355$https://www.inaturalist.org/taxa/49968',
              excerpt: 'Nurse Sharks',
              firstSentences: null,
              summary: null,
              flags: 'HasHtmlVersion;SkipSentencesScoring',
              hasHtmlVersion: true,
              score: 1528,
              percentScore: 80.12595,
              rankingInfo: null,
              isTopResult: false,
              isRecommendation: false,
              titleHighlights: [],
              firstSentencesHighlights: [],
              excerptHighlights: [],
              printableUriHighlights: [],
              summaryHighlights: [],
              absentTerms: [],
              raw: {
                urihash: 'hLSngTdxUj5Upy7r',
              },
            },
            {
              title: 'Brine Shrimp',
              uri: 'https://www.inaturalist.org/taxa/86651',
              printableUri: 'https://www.inaturalist.org/taxa/86651',
              clickUri: 'https://www.inaturalist.org/taxa/86651',
              uniqueId: '42.29355$https://www.inaturalist.org/taxa/86651',
              excerpt: 'Brine Shrimp',
              firstSentences: null,
              summary: null,
              flags: 'HasHtmlVersion;SkipSentencesScoring',
              hasHtmlVersion: true,
              score: 1528,
              percentScore: 80.12595,
              rankingInfo: null,
              isTopResult: false,
              isRecommendation: false,
              titleHighlights: [],
              firstSentencesHighlights: [],
              excerptHighlights: [],
              printableUriHighlights: [],
              summaryHighlights: [],
              absentTerms: [],
              raw: {
                urihash: '4L6GðEE1jMUNYhoC',
              },
            },
            {
              title: 'Dove Snails',
              uri: 'https://www.inaturalist.org/taxa/50704',
              printableUri: 'https://www.inaturalist.org/taxa/50704',
              clickUri: 'https://www.inaturalist.org/taxa/50704',
              uniqueId: '42.29355$https://www.inaturalist.org/taxa/50704',
              excerpt: 'Dove Snails',
              firstSentences: null,
              summary: null,
              flags: 'HasHtmlVersion;SkipSentencesScoring',
              hasHtmlVersion: true,
              score: 1528,
              percentScore: 80.12595,
              rankingInfo: null,
              isTopResult: false,
              isRecommendation: false,
              titleHighlights: [],
              firstSentencesHighlights: [],
              excerptHighlights: [],
              printableUriHighlights: [],
              summaryHighlights: [],
              absentTerms: [],
              raw: {
                urihash: 'vrTSILq8VzJAItOq',
              },
            },
          ];
          r.body.questionAnswer = {
            documentId: {
              contentIdKey: 'urihash',
              contentIdValue: r.body.results[0].raw.urihash,
            },
            question: 'a',
            answerSnippet: 'b',
            score: 1337,
            relatedQuestions: [
              {
                question: 'Where does the name "Nurse Sharks" come from?',
                answerSnippet: `
                  <p>
                    The name nurse shark is thought to be a corruption of <b>nusse</b>, a name which once referred to the catsharks of the family Scyliorhinidae.
                  </p>
                  <p>
                    The nurse shark family name, <b>Ginglymostomatidae</b>, derives from the Greek words <i>ginglymos</i> (γίγγλυμος) meaning "<b>hinge</b>" and <i>stoma</i> (στόμα) meaning "<b>mouth</b>". 
                  </p>
                `,
                documentId: {
                  contentIdKey: 'urihash',
                  contentIdValue: r.body.results[0].raw.urihash,
                },
                score: 100,
              },
              {
                question: 'What are sea monkeys?',
                answerSnippet: `
                  <p>
                    Breeds of Artemia are sold as novelty gifts under the marketing name Sea-Monkeys. 
                  </p>
                  <p>
                    <b>Artemia</b> is a genus of aquatic crustaceans also known as <b>brine shrimp</b>. Artemia, the only genus in the family <i>Artemiidae</i>.
                  </p>
                `,
                documentId: {
                  contentIdKey: 'urihash',
                  contentIdValue: r.body.results[1].raw.urihash,
                },
                score: 50,
              },
              {
                question: 'What is a dove snail?',
                answerSnippet: `
                  <p>
                    The <b>Columbellidae</b>, the dove snails or dove shells, are a family of minute to small sea snails, marine gastropod mollusks in the order <i>Neogastropoda</i>.
                  </p>
                `,
                documentId: {
                  contentIdKey: 'urihash',
                  contentIdValue: r.body.results[2].raw.urihash,
                },
                score: 25,
              },
            ],
          };
          return r;
        },
      },
    },
  }
);

export default defaultModuleExport;
export const DefaultSmartSnippetSuggestions = exportedStory;
