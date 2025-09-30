import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
  rgaGenerateRequestRegex,
  insightRgaGenerateRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {GeneratedAnswerObject} from './pageObject';
import genQaData from './data';
import type {GenQaData} from './data';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';
import {BaseFacetObject} from '../../../../../../playwright/page-object/baseFacetObject';

const MACHINE_LEARNING_API_URL = '**/machinelearning/streaming';
const ANSWER_API_URL = '**/answer/v1/configs/**/generate';
const ANSWER_API_INSIGHT_URL = '**/insight/v1/configs/**/answer/**/generate';

const pageUrl = 's/quantic-generated-answer';

interface GeneratedAnswerOptions {
  fieldsToIncludeInCitations: string;
  collapsible: boolean;
  withToggle: boolean;
  useCase: string;
  answerConfigurationId: string;
}

type QuanticGeneratedAnswerE2ESearchFixtures = {
  genQaData: GenQaData;
  generatedAnswer: GeneratedAnswerObject;
  search: SearchObject;
  options: Partial<GeneratedAnswerOptions>;
  withFacets: boolean;
  baseFacet: BaseFacetObject;
};

type QuanticGeneratedAnswerE2EInsightFixtures =
  QuanticGeneratedAnswerE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const exampleQuery = 'test';

export const testSearch = quanticBase.extend<QuanticGeneratedAnswerE2ESearchFixtures>({
  pageUrl,
  genQaData,
  options: {},
  analyticsMode: AnalyticsModeEnum.legacy,
  withFacets: false,
  search: async ({page}, use) => {
    await use(new SearchObject(page, searchRequestRegex));
  },
  baseFacet: async ({page}, use) => {
    await use(new BaseFacetObject(page, searchRequestRegex));
  },
  generatedAnswer: async (
    {
      page,
      options,
      configuration,
      search,
      genQaData: data,
      analytics,
      withFacets,
    },
    use
  ) => {
    const generatedAnswerObject = new GeneratedAnswerObject(
      page,
      data.streamId,
      analytics,
      !!options.answerConfigurationId,
      rgaGenerateRequestRegex,
      withFacets,
    );

    const streamingUrl = options.answerConfigurationId
      ? ANSWER_API_URL
      : `${MACHINE_LEARNING_API_URL}/${data.streamId}`;
    await generatedAnswerObject.mockStreamResponse(
      streamingUrl,
      data.streams,
      data.streamId
    );

    await page.goto(pageUrl);
    if (withFacets) {
      await generatedAnswerObject.clickAddFacetsButton();
    }
    await configuration.configure(options);
    await search.waitForSearchResponse();

      generatedAnswerObject.streamEndAnalyticRequestPromise =
        generatedAnswerObject.waitForStreamEndAnalytics();
      if (options.answerConfigurationId) {
        generatedAnswerObject.generateRequestPromise =
          generatedAnswerObject.waitForGenerateRequest();
      }

    await search.fillSearchInput(exampleQuery);
    await search.mockSearchWithGenerativeQuestionAnsweringId(data.streamId);
    await search.performSearch();
    await search.waitForSearchResponse();

    await use(generatedAnswerObject);
  },
});

export const testInsight =
  quanticBase.extend<QuanticGeneratedAnswerE2EInsightFixtures>({
    pageUrl,
    genQaData,
    options: {},
    analyticsMode: AnalyticsModeEnum.legacy,
    withFacets: false,
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    baseFacet: async ({page}, use) => {
      await use(new BaseFacetObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    generatedAnswer: async (
      {
        page,
        options,
        search,
        configuration,
        insightSetup,
        genQaData: data,
        analytics,
        withFacets,
      },
      use
    ) => {
      const generatedAnswerObject = new GeneratedAnswerObject(
        page,
        data.streamId,
        analytics,
        !!options.answerConfigurationId,
        insightRgaGenerateRequestRegex,
        withFacets
      );

      const streamingUrl = options.answerConfigurationId
        ? ANSWER_API_INSIGHT_URL
        : `${MACHINE_LEARNING_API_URL}/${data.streamId}`;
      await generatedAnswerObject.mockStreamResponse(
        streamingUrl,
        data.streams,
        data.streamId
      );

      await page.goto(pageUrl);
      if (withFacets) {
        await generatedAnswerObject.clickAddFacetsButton();
      }
      configuration.configure({...options, useCase: useCaseEnum.insight});

      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();

      await search.mockSearchWithGenerativeQuestionAnsweringId(data.streamId);
      generatedAnswerObject.streamEndAnalyticRequestPromise =
        generatedAnswerObject.waitForStreamEndAnalytics();
      if (options.answerConfigurationId) {
        generatedAnswerObject.generateRequestPromise =
          generatedAnswerObject.waitForGenerateRequest();
      }

      await search.fillSearchInput(exampleQuery);
      await search.performSearch();
      await search.waitForSearchResponse();

      await use(generatedAnswerObject);
    },
  });

export {expect} from '@playwright/test';
