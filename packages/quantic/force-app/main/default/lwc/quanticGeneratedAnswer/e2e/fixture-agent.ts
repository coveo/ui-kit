import {quanticBase} from '../../../../../../playwright/fixtures/baseFixture';
import {SearchObject} from '../../../../../../playwright/page-object/searchObject';
import {
  searchRequestRegex,
  agentAnswerRequestRegex,
  agentFollowUpRequestRegex,
} from '../../../../../../playwright/utils/requests';
import {GeneratedAnswerObject} from './pageObject';
import {agentResponseData} from '@coveo/platform-mock-api/agent';
import {AnalyticsModeEnum} from '../../../../../../playwright/utils/analyticsMode';

const pageUrl = 's/quantic-generated-answer';

interface AgentOptions {
  agentId: string;
  withToggle: boolean;
}

type QuanticGeneratedAnswerAgentE2EFixtures = {
  agentData: typeof agentResponseData;
  generatedAnswer: GeneratedAnswerObject;
  search: SearchObject;
  options: Partial<AgentOptions>;
};

export const exampleQuery = 'test';

export const testAgent =
  quanticBase.extend<QuanticGeneratedAnswerAgentE2EFixtures>({
    pageUrl,
    agentData: agentResponseData,
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
        data.headAnswer.answerId,
        analytics,
        {
          headAnswerRequestRegex: agentAnswerRequestRegex,
          agentFollowUpRequestRegex,
        }
      );

      await generatedAnswerObject.mockAgentAnswerResponse(
        data.headAnswer.messages
      );
      await generatedAnswerObject.mockAgentFollowUpResponse(
        data.followUpAnswers.map(({messages}) => messages)
      );
      
      await search.mockSearchWithBaseResponse();
      await page.goto(pageUrl);
      await configuration.configure(options);
      await search.waitForSearchResponse();

      generatedAnswerObject.streamEndAnalyticRequestPromise =
        generatedAnswerObject.waitForStreamEndAnalytics();
      generatedAnswerObject.generateRequestPromise =
        generatedAnswerObject.waitForHeadAnswerRequest();

      await search.fillSearchInput(exampleQuery);
      search.performSearch();
      await search.waitForSearchResponse();

      await use(generatedAnswerObject);
    },
  });

export {expect} from '@playwright/test';
