import {buildMockInsightState} from '../../test/mock-insight-state';
import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {logSearchboxSubmit} from './query-insight-analytics-actions';

const mockLogSearchboxSubmit = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logSearchboxSubmit: mockLogSearchboxSubmit,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

describe('logSearchboxSubmit', () => {
  it('should log #logSearchboxSubmit with the right payload', async () => {
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

    await engine.dispatch(logSearchboxSubmit());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogSearchboxSubmit).toBeCalledTimes(1);
    expect(mockLogSearchboxSubmit.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
