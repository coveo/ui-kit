import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-smart-snippet-suggestions',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInSearchInterface({
  config: {
    search: {
      preprocessSearchResponseMiddleware: (r) => {
        r.body.results = [
          {
            searchUid: 'myawesomeSearchUid',
            title: 'Nurse Sharks',
            uri: 'https://www.inaturalist.org/taxa/49968',
            printableUri: 'https://www.inaturalist.org/taxa/49968',
            clickUri: 'https://www.inaturalist.org/taxa/49968',
            uniqueId: '42.29355$https://www.inaturalist.org/taxa/49968',
            excerpt: 'Nurse Sharks',
            firstSentences: '',
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
            isUserActionView: false,
          },
          {
            searchUid: 'myawesomeSearchUid',
            title: 'Brine Shrimp',
            uri: 'https://www.inaturalist.org/taxa/86651',
            printableUri: 'https://www.inaturalist.org/taxa/86651',
            clickUri: 'https://www.inaturalist.org/taxa/86651',
            uniqueId: '42.29355$https://www.inaturalist.org/taxa/86651',
            excerpt: 'Brine Shrimp',
            firstSentences: '',
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
            isUserActionView: false,
          },
          {
            searchUid: 'myawesomeSearchUid',
            title: 'Dove Snails',
            uri: 'https://www.inaturalist.org/taxa/50704',
            printableUri: 'https://www.inaturalist.org/taxa/50704',
            clickUri: 'https://www.inaturalist.org/taxa/50704',
            uniqueId: '42.29355$https://www.inaturalist.org/taxa/50704',
            excerpt: 'Dove Snails',
            firstSentences: '',
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
            isUserActionView: false,
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
                The name nurse shark is thought to be a corruption of <b>nusse</b>, a name which once referred to the <a href="https://en.wikipedia.org/wiki/Catshark">catsharks</a> of the family Scyliorhinidae.
              </p>
              <p>
                The nurse shark family name, <b>Ginglymostomatidae</b>, derives from the <a href="https://en.wikipedia.org/wiki/Greek_language">Greek</a> words <i>ginglymos</i> (<a href="https://en.wiktionary.org/wiki/%CE%B3%CE%AF%CE%B3%CE%B3%CE%BB%CF%85%CE%BC%CE%BF%CF%82#Ancient_Greek">γίγγλυμος</a>) meaning "<b>hinge</b>" and <i>stoma</i> (<a href="https://en.wiktionary.org/wiki/%CF%83%CF%84%CF%8C%CE%BC%CE%B1#Ancient_Greek">στόμα</a>) meaning "<b>mouth</b>". 
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
                Breeds of Artemia are sold as novelty gifts under the marketing name <a href="https://en.wikipedia.org/wiki/Sea-Monkeys">Sea-Monkeys</a>. 
              </p>
              <p>
                <b>Artemia</b> is a genus of aquatic crustaceans also known as <b>brine shrimp</b>. It is the only genus in the <a href="https://en.wikipedia.org/wiki/Family_(biology)">family</a> <b>Artemiidae</b>.
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
                The <b>Columbellidae</b>, the dove snails or dove shells, are a <a href="https://en.wikipedia.org/wiki/Family_(biology)">family</a> of minute to small <a href="https://en.wikipedia.org/wiki/Sea_snail">sea snails</a>, <a href="https://en.wikipedia.org/wiki/Marine_(ocean)">marine</a> <a href="https://en.wikipedia.org/wiki/Gastropod">gastropod</a> <a href="https://en.wikipedia.org/wiki/Mollusk">mollusks</a> in the order <a href="https://en.wikipedia.org/wiki/Neogastropoda">Neogastropoda</a>.
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
});

const meta: Meta = {
  component: 'atomic-smart-snippet-suggestions',
  title: 'Search/SmartSnippet/SmartSnippetSuggestions',
  id: 'atomic-smart-snippet-suggestions',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-smart-snippet-suggestions',
};
