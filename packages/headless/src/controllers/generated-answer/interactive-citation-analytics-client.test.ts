import {
  logOpenGeneratedAnswerFollowUpSource,
  logOpenGeneratedAnswerSource,
} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {generativeQuestionAnsweringIdSelector} from '../../features/generated-answer/generated-answer-selectors.js';
import {buildInteractiveCitationAnalyticsClient} from './interactive-citation-analytics-client.js';

vi.mock('../../features/generated-answer/generated-answer-analytics-actions');
vi.mock('../../features/generated-answer/generated-answer-selectors');

describe('buildInteractiveCitationAnalyticsClient', () => {
  const citationId = 'citation-1';
  const headAnswerId = 'head-answer-id';
  const followUpAnswerId = 'follow-up-answer-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls logOpenGeneratedAnswerSource when no answerId is provided', () => {
    vi.mocked(generativeQuestionAnsweringIdSelector).mockReturnValue(headAnswerId);
    const client = buildInteractiveCitationAnalyticsClient(() => ({}));

    client.logCitationOpen(citationId);

    expect(logOpenGeneratedAnswerSource).toHaveBeenCalledWith(citationId);
    expect(logOpenGeneratedAnswerFollowUpSource).not.toHaveBeenCalled();
  });

  it('calls logOpenGeneratedAnswerSource when answerId matches head answer', () => {
    vi.mocked(generativeQuestionAnsweringIdSelector).mockReturnValue(headAnswerId);
    const client = buildInteractiveCitationAnalyticsClient(() => ({}));

    client.logCitationOpen(citationId, headAnswerId);

    expect(logOpenGeneratedAnswerSource).toHaveBeenCalledWith(citationId, headAnswerId);
    expect(logOpenGeneratedAnswerFollowUpSource).not.toHaveBeenCalled();
  });

  it('calls logOpenGeneratedAnswerFollowUpSource when answerId differs from head answer', () => {
    vi.mocked(generativeQuestionAnsweringIdSelector).mockReturnValue(headAnswerId);
    const client = buildInteractiveCitationAnalyticsClient(() => ({}));

    client.logCitationOpen(citationId, followUpAnswerId);

    expect(logOpenGeneratedAnswerFollowUpSource).toHaveBeenCalledWith(citationId, followUpAnswerId);
    expect(logOpenGeneratedAnswerSource).not.toHaveBeenCalled();
  });

  it('calls logOpenGeneratedAnswerSource when head answerId is undefined', () => {
    vi.mocked(generativeQuestionAnsweringIdSelector).mockReturnValue(undefined);
    const client = buildInteractiveCitationAnalyticsClient(() => ({}));

    client.logCitationOpen(citationId, followUpAnswerId);

    expect(logOpenGeneratedAnswerSource).toHaveBeenCalledWith(citationId, followUpAnswerId);
    expect(logOpenGeneratedAnswerFollowUpSource).not.toHaveBeenCalled();
  });
});
