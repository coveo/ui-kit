import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {SearchParameters} from '../../controllers';
import {SearchParametersState} from '../../state/search-app-state';
import {ConfigurationSection} from '../../state/state-sections';
import {AnalyticsType} from '../analytics/analytics-utils';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {logResultsSort} from '../sort-criteria/sort-criteria-analytics-actions';

/**
 * Logs the analytics event that corresponds best with the difference between previous and new search parameters
 * @param previousParameters The search parameters before the update
 * @param newParameters The search parameters after the update
 */
export const logSearchParametersChange = createAsyncThunk<
  {analyticsType: AnalyticsType.Search},
  {previousParameters: SearchParameters; newParameters: SearchParameters},
  AsyncThunkSearchOptions<Partial<SearchParametersState> & ConfigurationSection>
>(
  'analytics/searchParameters/change',
  async ({previousParameters, newParameters}, {dispatch}) => {
    if (previousParameters.q !== newParameters.q) {
      dispatch(logSearchboxSubmit());
    }

    if (previousParameters.sortCriteria !== newParameters.sortCriteria) {
      dispatch(logResultsSort());
    }

    // TODO: handle facet types changes

    return {analyticsType: AnalyticsType.Search};
  }
);
