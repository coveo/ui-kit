import * as analytics from '../client/analytics';
import * as donottrack from '../donottrack';
import * as history from '../history';
import * as SimpleAnalytics from './simpleanalytics';
import * as storage from '../storage';
export {CoveoAnalyticsClient, AnalyticsClientSendEventHook} from '../client/analytics';
export {PreprocessAnalyticsRequest} from '../client/analyticsRequestClient';
export {IRuntimeEnvironment} from '../client/runtimeEnvironment';
export {CoveoUA, getCurrentClient, handleOneAnalyticsEvent} from './simpleanalytics';
export {CoveoSearchPageClient, SearchPageClientProvider} from '../searchPage/searchPageClient';
export {SmartSnippetFeedbackReason} from '../searchPage/searchPageEvents';
export {CaseAssistClient} from '../caseAssist/caseAssistClient';

export {analytics, donottrack, history, SimpleAnalytics, storage};
