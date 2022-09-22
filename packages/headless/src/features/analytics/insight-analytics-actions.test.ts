import {buildMockInsightState} from '../../test/mock-insight-state';
import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
} from './insight-analytics-actions';
import {buildMockAnalyticsState} from '../../test/mock-analytics-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';

const mockLogInterfaceLoad = jest.fn();
const mockLogInterfaceChange = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logInterfaceLoad: mockLogInterfaceLoad,
  logInterfaceChange: mockLogInterfaceChange,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleOriginLevel2 = 'exampleOriginLevel2';

describe('logInterfaceLoad', () => {
  it('should log #logInterfaceLoad with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(logInsightInterfaceLoad());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogInterfaceLoad).toBeCalledTimes(1);
    expect(mockLogInterfaceLoad.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logInterfaceChange', () => {
  it('should log #logInterfaceChange with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        configuration: {
          ...getConfigurationInitialState(),
          analytics: buildMockAnalyticsState({
            originLevel2: exampleOriginLevel2,
          }),
        },
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });

    await engine.dispatch(logInsightInterfaceChange());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      interfaceChangeTo: exampleOriginLevel2,
    };

    expect(mockLogInterfaceChange).toBeCalledTimes(1);
    expect(mockLogInterfaceChange.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
