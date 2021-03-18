import {SearchParameters} from '../../controllers';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Logs the analytics event that corresponds best with the difference between previous and new search parameters
 * @param previousParameters The search parameters before the update
 * @param newParameters The search parameters after the update
 */
export const logSearchParametersChange = (
  previousParameters: SearchParameters,
  newParameters: SearchParameters
) =>
  makeAnalyticsAction(
    'analytics/interface/change',
    AnalyticsType.Search,
    (client) => {
      // TODO: Look at the difference between the 2 states
      console.log('parameters', previousParameters, newParameters);
      client.logSearchboxSubmit();
    }
  )();
