import {createRelay} from '@coveo/relay';
import {CoveoInsightClient} from 'coveo.analytics';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {clearMicrotaskQueue} from '../../test/unit-test-utils.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  logExpandToFullUI,
  logInsightCreateArticle,
  logOpenUserActions,
} from './insight-analytics-actions.js';

const mockLogCreateArticle = vi.fn();
const mockLogExpandtoFullUI = vi.fn();
const mockLogOpenUserActions = vi.fn();
const emit = vi.fn();

vi.mock('@coveo/relay');

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = vi.fn();
  this.logExpandToFullUI = mockLogExpandtoFullUI;
  this.logCreateArticle = mockLogCreateArticle;
  this.logOpenUserActions = mockLogOpenUserActions;
});

vi.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  updateConfig: vi.fn(),
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
    vi.clearAllMocks();
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

    describe('logOpenUserActions', () => {
      it('should call coveo.analytics.logOpenUserActions properly', async () => {
        await logOpenUserActions()()(
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

        expect(mockLogOpenUserActions).toHaveBeenCalledTimes(1);
        expect(mockLogOpenUserActions.mock.calls[0][0]).toStrictEqual(
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
