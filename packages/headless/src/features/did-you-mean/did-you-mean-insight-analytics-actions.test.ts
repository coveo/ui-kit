import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {
  logDidYouMeanAutomatic,
  logDidYouMeanClick,
} from './did-you-mean-insight-analytics-actions';

const mockLogDidYouMeanClick = jest.fn();
const mockLogDidYouMeanAutomatic = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logDidYouMeanClick: mockLogDidYouMeanClick,
  logDidYouMeanAutomatic: mockLogDidYouMeanAutomatic,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

describe('logDidYouMeanClick', () => {
  it('should log #logDidYouMeanClick with the right payload', async () => {
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

    await engine.dispatch(logDidYouMeanClick());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogDidYouMeanClick).toBeCalledTimes(1);
    expect(mockLogDidYouMeanClick.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});

describe('logDidYouMeanAutomatic', () => {
  it('should log #logDidYouMeanAutomatic with the right payload', async () => {
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

    await engine.dispatch(logDidYouMeanAutomatic());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogDidYouMeanAutomatic).toBeCalledTimes(1);
    expect(mockLogDidYouMeanAutomatic.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
