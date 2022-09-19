import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {
  logContextChanged,
  logExpandToFullUI,
} from './insight-search-analytics-actions';
import * as CoveoAnalytics from 'coveo.analytics';
import {getCaseContextInitialState} from '../case-context/case-context-state';

const mockLogContextChanged = jest.fn();
const mockLogExpandtoFullUI = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logContextChanged: mockLogContextChanged,
  logExpandToFullUI: mockLogExpandtoFullUI,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';

describe('logContextChanged', () => {
  it('should log #logContextChanged with the right payload', async () => {
    const exampleSubject = 'example subject';
    const exampleDescription = 'example description';

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
    await engine.dispatch(logContextChanged('1234', '5678'));

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: '1234',
      caseNumber: '5678',
    };

    expect(mockLogContextChanged).toBeCalledTimes(1);
    expect(mockLogContextChanged.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logExpandToFullUI', () => {
  it('should log #logExpandToFullUI with the right payload', async () => {
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
      logExpandToFullUI('1234', '5678', 'c__FullSearch', 'openFullSearchButton')
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: '1234',
      caseNumber: '5678',
      fullSearchComponentName: 'c__FullSearch',
      triggeredBy: 'openFullSearchButton',
    };

    expect(mockLogExpandtoFullUI).toBeCalledTimes(1);
    expect(mockLogExpandtoFullUI.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
