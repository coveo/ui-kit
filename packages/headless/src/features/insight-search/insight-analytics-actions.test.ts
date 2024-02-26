import {createRelay} from '@coveo/relay';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {clearMicrotaskQueue} from '../../test/unit-test-utils';
import {getCaseContextInitialState} from '../case-context/case-context-state';
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
  clearStorage: jest.fn(),
  version: 'foo',
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleCreateArticleMetadata = {
  articleType: 'Knowledge__kav',
};

describe('result actions insight analytics actions', () => {
  let engine: MockInsightEngine;
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
      engine = buildMockInsightEngine({
        state: buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          insightCaseContext: caseContextState,
        }),
      });
    });

    describe('logCreateArticle', () => {
      it('should call coveo.analytics.logCreateArticle properly', async () => {
        await engine.dispatch(
          logInsightCreateArticle(exampleCreateArticleMetadata)
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
        const engine = buildMockInsightEngine({
          state: buildMockInsightState({
            insightCaseContext: {
              ...getCaseContextInitialState(),
              caseContext: {
                Case_Subject: exampleSubject,
                Case_Description: exampleDescription,
              },
            },
          }),
        });
        await engine.dispatch(
          logExpandToFullUI(
            exampleCaseId,
            exampleCaseNumber,
            'c__FullSearch',
            'openFullSearchButton'
          )
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
      engine = buildMockInsightEngine({
        state: buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'next',
            },
          },
          insightCaseContext: caseContextState,
        }),
      });
    });

    describe('logCreateArticle', () => {
      it('should call relay.emit properly', async () => {
        engine.dispatch(logInsightCreateArticle(exampleCreateArticleMetadata));
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });

    describe('logExpandToFullUI', () => {
      it('should call relay.emit properly', async () => {
        engine.dispatch(
          logExpandToFullUI(exampleCaseId, exampleCaseNumber, '', '')
        );
        await clearMicrotaskQueue();

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });
  });
});
