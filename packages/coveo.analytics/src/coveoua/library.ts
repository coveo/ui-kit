import * as analytics from '../client/analytics';
import * as donottrack from '../donottrack';
import * as history from '../history';
import * as SimpleAnalytics from './simpleanalytics';
import * as storage from '../storage';
export {CoveoAnalyticsClient, AnalyticsClientSendEventHook} from '../client/analytics';
export {PreprocessAnalyticsRequest} from '../client/analyticsRequestClient';
export {IRuntimeEnvironment} from '../client/runtimeEnvironment';
export {CoveoUA, getCurrentClient, handleOneAnalyticsEvent} from './simpleanalytics';
export {
    CoveoSearchPageClient,
    SearchPageClientProvider,
    EventDescription,
    EventBuilder,
} from '../searchPage/searchPageClient';
export {CaseAssistClient, CaseAssistClientProvider} from '../caseAssist/caseAssistClient';
export {CoveoInsightClient, InsightClientProvider} from '../insight/insightClient';

export * from '../searchPage/searchPageEvents';
export * from '../caseAssist/caseAssistActions';
export * from '../insight/insightEvents';
export * from '../events';

export {analytics, donottrack, history, SimpleAnalytics, storage};
