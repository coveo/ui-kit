import {
  notifyStreamAborted,
  registerAnswerStreamManager,
  streamAnswer,
} from '../../../features/generated-answer/generated-answer-actions';
import {
  MockedCoreEngine,
  buildMockCoreEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  AnswerStreamManagerEngine,
  buildAnswerStreamManager,
} from './headless-answer-stream-manager';

jest.mock('../../../features/generated-answer/generated-answer-actions');

describe('AnswerStreamManager', () => {
  const mockedStreamAnswer = jest.mocked(streamAnswer);
  const mockedNotifyStreamAborted = jest.mocked(notifyStreamAborted);

  let engine: MockedCoreEngine;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when no answer stream manager is registered', () => {
    beforeEach(() => {
      const preloadedState = createMockState();
      engine = buildMockCoreEngine(preloadedState);
      buildAnswerStreamManager(engine as unknown as AnswerStreamManagerEngine);
    });

    it('should register an answer stream manager', () => {
      expect(engine.dispatch).toHaveBeenCalledWith(registerAnswerStreamManager);
    });

    it('should subscribe to the engine', () => {
      expect(engine.subscribe).toHaveBeenCalled();
    });
  });

  describe('when an answer stream manager is registered', () => {
    beforeEach(() => {
      const preloadedState = createMockState();
      preloadedState.generatedAnswer.hasAnswerStreamManager = true;
      engine = buildMockCoreEngine(preloadedState);
      buildAnswerStreamManager(engine as unknown as AnswerStreamManagerEngine);
    });

    it('should not register an answer stream manager', () => {
      expect(engine.dispatch).not.toHaveBeenCalledWith(
        registerAnswerStreamManager
      );
    });

    it('should not subscribe to the engine', () => {
      expect(engine.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('when the subscriber is called and `shouldStartStream` is true', () => {
    beforeEach(() => {
      const preloadedState = createMockState();
      preloadedState.generatedAnswer.shouldStartStream = true;
      engine = buildMockCoreEngine(preloadedState);
      buildAnswerStreamManager(engine as unknown as AnswerStreamManagerEngine);
    });

    it('should dispatch `streamAnswer`', () => {
      engine.subscribe.mock.calls[0][0]();

      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedStreamAnswer.mock.results[0].value
      );
    });

    it('should calls abort on any previous abort controller', () => {
      engine.subscribe.mock.calls[0][0]();
      const mockedAbort = jest.fn();
      mockedStreamAnswer.mock.calls[0][0].setAbortControllerRef({
        abort: mockedAbort,
      } as unknown as AbortController);

      engine.subscribe.mock.calls[0][0]();

      expect(mockedAbort).toHaveBeenCalled();
    });
  });

  describe('when the subscriber is called and `shouldAbortStream` is true', () => {
    let shouldStartStreamStateMock: jest.Mock;
    beforeEach(() => {
      shouldStartStreamStateMock = jest.fn();
      shouldStartStreamStateMock.mockReturnValue(false);
      const preloadedState = createMockState();
      preloadedState.generatedAnswer.shouldAbortStream = true;
      Object.defineProperty(
        preloadedState.generatedAnswer,
        'shouldStartStream',
        {
          get: shouldStartStreamStateMock,
        }
      );
      engine = buildMockCoreEngine(preloadedState);
      buildAnswerStreamManager(engine as unknown as AnswerStreamManagerEngine);
    });

    it('should dispatch `notifyStreamAborted`', () => {
      engine.subscribe.mock.calls[0][0]();

      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedNotifyStreamAborted.mock.results[0].value
      );
    });

    it('should calls abort on any previous abort controller', () => {
      shouldStartStreamStateMock.mockReturnValueOnce(true);
      engine.subscribe.mock.calls[0][0]();
      const mockedAbort = jest.fn();
      mockedStreamAnswer.mock.calls[0][0].setAbortControllerRef({
        abort: mockedAbort,
      } as unknown as AbortController);

      engine.subscribe.mock.calls[0][0]();
      expect(mockedAbort).toHaveBeenCalled();
    });
  });

  describe('when the subscriber is called and `shouldStartStream` and `shouldAbortStream` are true', () => {
    beforeEach(() => {
      const preloadedState = createMockState();
      preloadedState.generatedAnswer.shouldStartStream = true;
      preloadedState.generatedAnswer.shouldAbortStream = true;
      engine = buildMockCoreEngine(preloadedState);
      buildAnswerStreamManager(engine as unknown as AnswerStreamManagerEngine);
    });

    it('should dispatch `streamAnswer`', () => {
      engine.subscribe.mock.calls[0][0]();

      expect(engine.dispatch).toHaveBeenCalledWith(
        mockedStreamAnswer.mock.results[0].value
      );
    });

    it('should calls abort on any previous abort controller', () => {
      const mockedAbort = jest.fn();
      engine.subscribe.mock.calls[0][0]();
      mockedStreamAnswer.mock.calls[0][0].setAbortControllerRef({
        abort: mockedAbort,
      } as unknown as AbortController);

      engine.subscribe.mock.calls[0][0]();
      expect(mockedAbort).toHaveBeenCalled();
    });

    it('should not dispatch `notifyStreamAborted`', () => {
      engine.subscribe.mock.calls[0][0]();

      expect(mockedNotifyStreamAborted).not.toHaveBeenCalled();
    });
  });
});
