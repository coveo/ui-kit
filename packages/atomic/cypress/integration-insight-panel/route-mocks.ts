import {buildMockResult, buildMockRaw} from '../utils/mock-result';

export const insightSearchAlias = '@CoveoInsight';
const searchRouteMatcher =
  '**/rest/organizations/*/insight/v1/configs/*/search';

export const interceptInsightSearch = (alias = insightSearchAlias) =>
  cy.intercept(searchRouteMatcher).as(alias.substring(1));

const inactiveLink = 'javascript:void(0);';
const exampleSmartSnippetQuestion = 'Example smart snippet question';
const exampleSmartSnippetSourceUri = inactiveLink;
const exampleSmartSnippetSourceTitle = 'Example result title';
const examplePermanentId = '123';
const exampleInlineLinkText = 'Example inline link';
const exampleInlineLinkUrl = inactiveLink;
const exampleSmartSnippetAnswer = `
    <div>
      <p>Example smart snippet answer</p>
      <a data-cy="smart-snippet__inline-link" href="${exampleInlineLinkUrl}">${exampleInlineLinkText}</a>
    </div>
  `;
const exampleRelatedQuestions = [
  {
    question: 'first example question',
    answerSnippet: exampleSmartSnippetAnswer,
    title: 'first example title',
    uri: inactiveLink,
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: '123',
    },
  },
  {
    question: 'second example question',
    answerSnippet: exampleSmartSnippetAnswer,
    title: 'second example title',
    uri: inactiveLink,
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: '456',
    },
  },
];

export const mockSearchWithSmartSnippet = (
  smartSnippetOptions: {
    question: string;
    answer: string;
    title: string;
    uri: string;
    permanentId: string;
  } = {
    question: exampleSmartSnippetQuestion,
    answer: exampleSmartSnippetAnswer,
    title: exampleSmartSnippetSourceTitle,
    uri: exampleSmartSnippetSourceUri,
    permanentId: examplePermanentId,
  }
) => {
  const {question, answer, title, uri, permanentId} = smartSnippetOptions;
  cy.intercept(searchRouteMatcher, (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        answerFound: true,
        answerSnippet: answer,
        question: question,
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: permanentId,
        },
        relatedQuestions: [],
      };
      res.body.results = [
        buildMockResult({
          uri: uri,
          title: title,
          clickUri: uri,
          uniqueId: '123',
          raw: buildMockRaw({permanentid: permanentId, urihash: 'potato'}),
        }),
      ];
      res.send();
    });
  }).as(insightSearchAlias.substring(1));
};

export const mockSearchWithoutSmartSnippet = (alias = insightSearchAlias) => {
  cy.intercept(searchRouteMatcher, (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        answerFound: false,
        question: '',
        answerSnippet: '',
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: '',
        },
        score: 0,
        relatedQuestions: [],
      };
      res.send();
    });
  }).as(alias.substring(1));
};

export const mockSearchWithSmartSnippetSuggestions = (
  relatedQuestions: Array<{
    question: string;
    answerSnippet: string;
    title: string;
    uri: string;
    documentId: {
      contentIdKey: string;
      contentIdValue: string;
    };
  }> = exampleRelatedQuestions
) => {
  cy.intercept(searchRouteMatcher, (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        relatedQuestions: relatedQuestions,
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: 'example permanentId',
        },
      };
      res.body.results = relatedQuestions.map(({title, uri, documentId}) =>
        buildMockResult({
          uri,
          title,
          clickUri: uri,
          uniqueId: '123',
          raw: buildMockRaw({
            permanentid: documentId.contentIdValue,
            urihash: 'someUriHash',
          }),
        })
      );
      res.send();
    });
  }).as(insightSearchAlias.substring(1));
};

export const mockSearchWithoutSmartSnippetSuggestions = () => {
  cy.intercept(searchRouteMatcher, (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        answerFound: false,
        question: '',
        answerSnippet: '',
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: '',
        },
        score: 0,
        relatedQuestions: [],
      };
      res.send();
    });
  }).as(insightSearchAlias.substring(1));
};
