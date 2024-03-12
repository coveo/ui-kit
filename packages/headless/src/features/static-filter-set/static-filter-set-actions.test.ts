import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {logInsightStaticFilterDeselect} from './static-filter-set-insight-analytics-actions';

const mockOriginalStaticFilterDeselect = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logStaticFilterDeselect: mockOriginalStaticFilterDeselect,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const examplestaticFilterId = 'examplestaticFilterId';
const examplestaticFilterValue = {caption: 'string', expression: 'string;'};

describe('logStaticFilterDeselect', () => {
  it('should log #logStaticFilterDeselect with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      })
    );
    await logInsightStaticFilterDeselect({
      staticFilterId: examplestaticFilterId,
      staticFilterValue: examplestaticFilterValue,
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

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

    expect(mockOriginalStaticFilterDeselect).toBeCalledTimes(1);
    expect(mockOriginalStaticFilterDeselect.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
