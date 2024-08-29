import {createRelay} from '@coveo/relay';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {clearMicrotaskQueue} from '../../test/unit-test-utils';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  logExpandToFullUI,
  logInsightCreateArticle,
} from './insight-analytics-actions';

const mockLogCreateArticle = jest.fn();
const mockLogExpandtoFullUI = jest.fn();
const emit = jest.fn();

jest.mock('@coveo/relay');

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: jest.fn(),
    logExpandToFullUI: mockLogExpandtoFullUI,
    logCreateArticle: mockLogCreateArticle,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

jest.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  updateConfig: jest.fn(),
  version: 'foo',
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleCreateArticleMetadata = {
  articleType: 'Knowledge__kav',
};

describe('insight analytics actions', () => {
  let engine: InsightEngine;
  const caseContextState = {
    caseContext: {
      Case_Subject: exampleSubject,
      Case_Description: exampleDescription,
    },
    caseId: exampleCaseId,
    caseNumber: exampleCaseNumber,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when analyticsMode is `legacy`', () => {
    beforeEach(() => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          insightCaseContext: caseContextState,
        })
      );
    });

    describe('logCreateArticle', () => {
      it('should call coveo.analytics.logCreateArticle properly', async () => {
        await logInsightCreateArticle(exampleCreateArticleMetadata)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        const expectedPayload = {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        };

        expect(mockLogCreateArticle).toHaveBeenCalledTimes(1);
        expect(mockLogCreateArticle.mock.calls[0][0]).toStrictEqual(
          exampleCreateArticleMetadata
        );
        expect(mockLogCreateArticle.mock.calls[0][1]).toStrictEqual(
          expectedPayload
        );
      });
    });

    describe('logExpandToFullUI', () => {
      it('should call coveo.analytics.logExpandToFullUI properly', async () => {
        await logExpandToFullUI('c__FullSearch', 'openFullSearchButton')()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        const expectedPayload = {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
          fullSearchComponentName: 'c__FullSearch',
          triggeredBy: 'openFullSearchButton',
        };

        expect(mockLogExpandtoFullUI).toHaveBeenCalledTimes(1);
        expect(mockLogExpandtoFullUI.mock.calls[0][0]).toStrictEqual(
          expectedPayload
        );
      });
    });
  });

  describe('when analyticsMode is `next`', () => {
    beforeEach(() => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'next',
            },
          },
          insightCaseContext: caseContextState,
        })
      );
    });

    describe('logCreateArticle', () => {
      it('should call relay.emit properly', async () => {
        await logInsightCreateArticle(exampleCreateArticleMetadata)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });

    describe('logExpandToFullUI', () => {
      it('should call relay.emit properly', async () => {
        await logExpandToFullUI('', '')()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });
  });
});
