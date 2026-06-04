import {configureStore} from '@reduxjs/toolkit';
import type {Mock} from 'vitest';
import {
  type AnswerEvaluationPOSTParams,
  answerEvaluation,
} from './post-answer-evaluation.js';

const {Response} = await vi.importActual('node-fetch');
const originalFetch = global.fetch;

const mockEvaluationBody: AnswerEvaluationPOSTParams = {
  additionalNotes: null,
  answer: {
    format: 'text/plain',
    responseId: 'answer-id',
    text: 'answer',
  },
  correctAnswerUrl: null,
  details: {
    correctTopic: null,
    documented: null,
    hallucinationFree: null,
    readable: null,
  },
  helpful: false,
  question: 'question',
};

const buildStore = () =>
  configureStore({
    reducer: {
      configuration: (
        state = {
          accessToken: 'access-token',
          environment: 'prod',
          organizationId: 'myorg',
        }
      ) => state,
      generatedAnswer: (
        state = {
          answerConfigurationId: 'answer-configuration-id',
        }
      ) => state,
      [answerEvaluation.reducerPath]: answerEvaluation.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(answerEvaluation.middleware),
  });

describe('answerEvaluation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('treats a failed evaluation request as an RTK Query error and expects the correct error object', async () => {
    (global.fetch as Mock).mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({message: 'boom'}), {
          headers: {'content-type': 'application/json'},
          status: 500,
        })
      )
    );
    const store = buildStore();

    const result = store
      .dispatch(answerEvaluation.endpoints.post.initiate(mockEvaluationBody))
      .unwrap();
    const expectation = expect(result).rejects.toMatchObject({
      data: {message: 'boom'},
      status: 500,
    });
    await vi.runAllTimersAsync();

    await expectation;
  });

  it('treats a successful evaluation request as an RTK Query success and expects the correct result', async () => {
    (global.fetch as Mock).mockImplementation(() =>
      Promise.resolve(
        new Response(null, {
          headers: {'content-type': 'application/json'},
          status: 204,
        })
      )
    );
    const store = buildStore();

    const result = store
      .dispatch(answerEvaluation.endpoints.post.initiate(mockEvaluationBody))
      .unwrap();
    const expectation = expect(result).resolves.toBeNull();
    await vi.runAllTimersAsync();

    await expectation;
  });
});
