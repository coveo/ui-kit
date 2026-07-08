import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  agentAnswerRequestRegex,
  agentFollowUpRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {GeneratedAnswerObject} from './pageObject';
import agentData from './agentData';
import type {AgentData} from './agentData';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';

const pageUrl = 's/quantic-generated-answer';

interface AgentOptions {
  agentId: string;
  withToggle: boolean;
}

type QuanticGeneratedAnswerAgentE2EFixtures = {
  agentData: AgentData;
  generatedAnswer: GeneratedAnswerObject;
  search: SearchObject;
  options: Partial<AgentOptions>;
};

export const exampleQuery = 'test';

export const testAgent =
  quanticBase.extend<QuanticGeneratedAnswerAgentE2EFixtures>({
    pageUrl,
    agentData,
    options: {},
    analyticsMode: AnalyticsModeEnum.legacy,
    search: async ({page}, use) => {
      await use(new SearchObject(page, searchRequestRegex));
    },
    generatedAnswer: async (
      {page, options, configuration, search, agentData: data, analytics},
      use
    ) => {
      const generatedAnswerObject = new GeneratedAnswerObject(
        page,
        data.answerId1,
        analytics,
        {
          agentAnswerRequestRegex,
          agentFollowUpRequestRegex,
          isAgent: true,
        }
      );

      await generatedAnswerObject.mockAgentAnswerResponse(
        data.answerStreams
      );
      await generatedAnswerObject.mockAgentFollowUpResponse(
        data.followUpStreams
      );

      await page.goto(pageUrl);
      await configuration.configure(options);
      await search.waitForSearchResponse();

      generatedAnswerObject.streamEndAnalyticRequestPromise =
        generatedAnswerObject.waitForStreamEndAnalytics();
      generatedAnswerObject.generateRequestPromise =
        generatedAnswerObject.waitForAgentAnswerRequest();

      await search.fillSearchInput(exampleQuery);
      await search.performSearch();
      await search.waitForSearchResponse();

      await use(generatedAnswerObject);
    },
  });

export {expect} from '@playwright/test';
