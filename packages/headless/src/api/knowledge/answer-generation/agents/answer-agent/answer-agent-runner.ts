import type {Dispatch} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../../../../app/navigator-context-provider.js';
import {
  selectAccessToken,
  selectAgentId,
  selectEnvironment,
  selectOrganizationId,
} from '../../../../../features/configuration/configuration-selectors.js';
import {
  constructGenerateHeadAnswerParams,
  type StateNeededForHeadAnswerParams,
} from '../../../../../features/generated-answer/generated-answer-request.js';
import {type AnswerAgent, createAnswerAgent} from './answer-agent.js';
import {createHeadAnswerStrategy} from './head-answer-strategy.js';

/**
 * Creates an AnswerRunner responsible for executing and managing
 * the lifecycle of an AnswerAgent.
 *
 * The runner ensures that only one agent runs at a time.
 * If a new run is triggered, any currently running agent is aborted.
 */
export const createAnswerRunner = () => {
  let currentAgent: AnswerAgent | undefined;

  const abortRun = () => {
    currentAgent?.abortRun();
    currentAgent = undefined;
  };

  const run = (
    state: StateNeededForHeadAnswerParams,
    dispatch: Dispatch,
    getNavigatorContext: () => NavigatorContext
  ) => {
    abortRun();

    const agentId = selectAgentId(state);
    const organizationId = selectOrganizationId(state);
    const environment = selectEnvironment(state);
    const accessToken = selectAccessToken(state);

    const agent = createAnswerAgent(agentId!, organizationId, environment);

    currentAgent = agent;

    const strategy = createHeadAnswerStrategy(dispatch);
    const params = constructGenerateHeadAnswerParams(
      state,
      getNavigatorContext()
    );

    agent.runAgent(
      {
        forwardedProps: {
          params,
          accessToken,
        },
      },
      strategy
    );
  };

  return {
    run,
    abortRun,
  };
};
