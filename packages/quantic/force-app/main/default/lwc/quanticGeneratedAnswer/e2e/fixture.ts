import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  insightSearchRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {InsightSetupObject} from '../../../../../../playwright/page-object/insightSetupObject';
import {useCaseEnum} from '../../../../../../playwright/utils/useCase';
import {GeneratedAnswerObject} from './pageObject';
import genQaData from './data';
import type {GenQaData} from './data';

const pageUrl = 's/quantic-generated-answer';

interface GeneratedAnswerOptions {
  fieldsToIncludeInCitations: string;
  collapsible: boolean;
  withToggle: boolean;
  useCase: string;
}

type QuanticGeneratedAnswerE2ESearchFixtures = {
  genQaData: GenQaData;
  generatedAnswer: GeneratedAnswerObject;
  search: SearchObject;
  options: Partial<GeneratedAnswerOptions>;
};

type QuanticGeneratedAnswerE2EInsightFixtures =
  QuanticGeneratedAnswerE2ESearchFixtures & {
    insightSetup: InsightSetupObject;
  };

export const testSearch =
  quanticBase.extend<QuanticGeneratedAnswerE2ESearchFixtures>({
    genQaData,
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    generatedAnswer: async (
      {page, options, configuration, search, genQaData: data},
      use
    ) => {
      const generatedAnswerObject = new GeneratedAnswerObject(
        page,
        data.streamId
      );
      await page.goto(pageUrl);
      await search.mockSearchWithGenerativeQuestionAnsweringId(data.streamId);
      await generatedAnswerObject.mockStreamResponse(data.streams);
      await configuration.configure(options);
      await search.waitForSearchResponse();
      await use(generatedAnswerObject);
    },
  });

export const testInsight =
  quanticBase.extend<QuanticGeneratedAnswerE2EInsightFixtures>({
    genQaData,
    options: {},
    search: async ({page}, use) => {
      await use(new SearchObject(page, insightSearchRequestRegex));
    },
    insightSetup: async ({page}, use) => {
      await use(new InsightSetupObject(page));
    },
    generatedAnswer: async (
      {page, options, search, configuration, insightSetup, genQaData: data},
      use
    ) => {
      const generatedAnswerObject = new GeneratedAnswerObject(
        page,
        data.streamId
      );
      await page.goto(pageUrl);
      await search.mockSearchWithGenerativeQuestionAnsweringId(data.streamId);
      await generatedAnswerObject.mockStreamResponse(data.streams);
      configuration.configure({...options, useCase: useCaseEnum.insight});
      await insightSetup.waitForInsightInterfaceInitialization();
      await search.performSearch();
      await search.waitForSearchResponse();
      await use(generatedAnswerObject);
    },
  });

export {expect} from '@playwright/test';
