/** biome-ignore-all lint/suspicious/noExplicitAny: unit test */

import type {Dispatch} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {NavigatorContext} from '../../../../../app/navigator-context-provider.js';
import {
  selectAccessToken,
  selectAgentId,
  selectEnvironment,
  selectOrganizationId,
} from '../../../../../features/configuration/configuration-selectors.js';
import {setIsLoading} from '../../../../../features/generated-answer/generated-answer-actions.js';
import {constructGenerateHeadAnswerParams} from '../../../../../features/generated-answer/generated-answer-request.js';
import {type AnswerAgent, createAnswerAgent} from './answer-agent.js';
import {createAnswerRunner} from './answer-agent-runner.js';
import {createHeadAnswerStrategy} from './head-answer-strategy.js';

vi.mock('./answer-agent.js', () => ({
  createAnswerAgent: vi.fn(),
}));

vi.mock(
  '../../../../../features/configuration/configuration-selectors.js',
  () => ({
    selectAgentId: vi.fn(),
    selectOrganizationId: vi.fn(),
    selectEnvironment: vi.fn(),
    selectAccessToken: vi.fn(),
  })
);

vi.mock(
  '../../../../../features/generated-answer/generated-answer-request.js',
  () => ({
    constructGenerateHeadAnswerParams: vi.fn(),
  })
);

vi.mock('./head-answer-strategy.js', () => ({
  createHeadAnswerStrategy: vi.fn(),
}));

describe('createAnswerRunner', () => {
  const mockAgent = {
    runAgent: vi.fn(),
    abortRun: vi.fn(),
  } as unknown as AnswerAgent;
  const state = {mock: 'state'} as any;
  const dispatch = vi.fn() as unknown as Dispatch;
  const navigatorContext: NavigatorContext = {
    referrer: null,
    userAgent: null,
    location: null,
    clientId: 'client-id',
  };
  const navigatorProvider = vi.fn(() => navigatorContext);
  const exampleStrategy = {onRunStartedEvent: () => {}};

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(selectAgentId).mockReturnValue('agent-123');
    vi.mocked(selectOrganizationId).mockReturnValue('org-123');
    vi.mocked(selectEnvironment).mockReturnValue('prod');
    vi.mocked(selectAccessToken).mockReturnValue('abc');
    vi.mocked(constructGenerateHeadAnswerParams).mockReturnValue({
      query: 'hello',
    } as any);
    vi.mocked(createHeadAnswerStrategy).mockReturnValue(exampleStrategy);
    vi.mocked(createAnswerAgent).mockReturnValue(mockAgent);
  });

  const buildRunner = () => createAnswerRunner();

  it('aborts the previous run before starting a new one', () => {
    const runner = buildRunner();

    runner.run(state, dispatch, navigatorProvider);
    runner.run(state, dispatch, navigatorProvider);

    expect(mockAgent.abortRun).toHaveBeenCalledTimes(1);
  });

  it('creates the agent using configuration selectors', () => {
    const runner = buildRunner();

    runner.run(state, dispatch, navigatorProvider);

    expect(createAnswerAgent).toHaveBeenCalledWith(
      'agent-123',
      'org-123',
      'prod'
    );
  });

  it('builds the strategy and executes the agent with forwarded props', () => {
    const runner = buildRunner();

    runner.run(state, dispatch, navigatorProvider);

    expect(createHeadAnswerStrategy).toHaveBeenCalledWith(dispatch);
    expect(constructGenerateHeadAnswerParams).toHaveBeenCalledWith(
      state,
      navigatorContext
    );
    expect(navigatorProvider).toHaveBeenCalled();
    expect(mockAgent.runAgent).toHaveBeenCalledWith(
      {
        forwardedProps: {
          params: {query: 'hello'},
          accessToken: 'abc',
        },
      },
      exampleStrategy
    );
  });

  it('exposes an abortRun helper that cancels the active agent', () => {
    const runner = buildRunner();

    runner.run(state, dispatch, navigatorProvider);
    runner.abortRun();

    expect(mockAgent.abortRun).toHaveBeenCalledTimes(1);
  });

  it('dispatches the loading state when a run starts', () => {
    const runner = buildRunner();

    runner.run(state, dispatch, navigatorProvider);

    expect(dispatch).toHaveBeenCalledWith(setIsLoading(true));
  });
});
