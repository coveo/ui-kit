import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {logInsightStaticFilterDeselect} from './static-filter-set-insight-analytics-actions';

const mockogStaticFilterDeselect = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logStaticFilterDeselect: mockogStaticFilterDeselect,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const examplestaticFilterId = 'examplestaticFilterId';
const examplestaticFilterValue = {caption: 'string', expression: 'string;'};

describe('logStaticFilterDeselect', () => {
  it('should log #logStaticFilterDeselect with the right payload', async () => {
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

    await engine.dispatch(
      logInsightStaticFilterDeselect({
        staticFilterId: examplestaticFilterId,
        staticFilterValue: examplestaticFilterValue,
      })
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      staticFilterValue: examplestaticFilterValue,
      staticFilterId: examplestaticFilterId,
    };

    expect(mockogStaticFilterDeselect).toBeCalledTimes(1);
    expect(mockogStaticFilterDeselect.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
