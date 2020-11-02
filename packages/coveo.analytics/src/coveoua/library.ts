import * as analytics from '../client/analytics';
import * as donottrack from '../donottrack';
import * as history from '../history';
import * as SimpleAnalytics from './simpleanalytics';
import * as storage from '../storage';
export {formattedCustomDataFromArray} from '../utils/formatted-custom-data-from-array';
export {CoveoAnalyticsClient} from '../client/analytics';
export {CoveoUA, handleOneAnalyticsEvent} from './simpleanalytics';
export {CoveoSearchPageClient, SearchPageClientProvider} from '../searchPage/searchPageClient';

export {analytics, donottrack, history, SimpleAnalytics, storage};
