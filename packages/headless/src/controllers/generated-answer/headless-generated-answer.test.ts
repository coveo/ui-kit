import {nextAnalyticsUsageWithServiceFeatureWarning} from '../../app/engine.js';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {updateResponseFormat} from '../../features/generated-answer/generated-answer-actions.js';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildGeneratedAnswerWithFollowUps} from '../knowledge/generated-answer/headless-generated-answer-with-follow-ups.js';
import {
  buildGeneratedAnswer,
  type GeneratedAnswerProps,
  type GeneratedResponseFormat,
} from './headless-generated-answer.js';

vi.mock('../../features/generated-answer/generated-answer-actions');
vi.mock('../../features/search/search-actions');
vi.mock(
  '../knowledge/generated-answer/headless-generated-answer-with-follow-ups.js',
  () => ({
    buildGeneratedAnswerWithFollowUps: vi.fn(),
  })
);

describe('generated answer', () => {
  let engine: MockedSearchEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    buildGeneratedAnswer(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initialize the format', () => {
    const responseFormat: GeneratedResponseFormat = {
      contentFormat: ['text/markdown'],
    };
    initGeneratedAnswer({
      initialState: {responseFormat},
    });

    expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
  });

  describe('building the controller with the next analytics mode', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({analyticsMode: 'next'}),
          },
        })
      );
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should log a warning when the controller is used with the next analytics mode', () => {
      initGeneratedAnswer();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        nextAnalyticsUsageWithServiceFeatureWarning
      );
    });
  });

  describe('building the controller with the legacy analytics mode', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: buildMockAnalyticsState({analyticsMode: 'legacy'}),
          },
        })
      );
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should not log a warning when the controller is used with the legacy analytics mode', () => {
      initGeneratedAnswer();
      expect(warnSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('the agentId prop', () => {
    describe('when building the controller with agentId', () => {
      it('should call buildGeneratedAnswerWithFollowUps when agentId is present', () => {
        const agentId = 'test-agent-id';
        const props: GeneratedAnswerProps = {agentId};

        initGeneratedAnswer(props);

        expect(buildGeneratedAnswerWithFollowUps).toHaveBeenCalledWith(
          engine,
          expect.anything(),
          props
        );
      });
    });

    describe('when building the controller without agentId', () => {
      it('should not call buildGeneratedAnswerWithFollowUps when agentId is absent', () => {
        const props: GeneratedAnswerProps = {
          answerConfigurationId: 'test-answer-configuration-id',
        };

        initGeneratedAnswer(props);

        expect(buildGeneratedAnswerWithFollowUps).not.toHaveBeenCalled();
      });
    });
  });
});
