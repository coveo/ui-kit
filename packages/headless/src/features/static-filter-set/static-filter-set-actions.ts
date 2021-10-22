import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {
  staticFilterIdSchema,
  staticFilterValueSchema,
  staticFilterValuesSchema,
} from './static-filter-set-schema';
import {StaticFilterValue} from './static-filter-set-state';

export interface RegisterStaticFilterActionCreatorPayload {
  /**
   * A unique identifier for the static filter.
   */
  id: string;

  /**
   * The values of the static filter.
   */
  values: StaticFilterValue[];
}

export const registerStaticFilter = createAction(
  'staticFilter/register',
  (payload: RegisterStaticFilterActionCreatorPayload) => {
    const schema = {
      id: staticFilterIdSchema,
      values: staticFilterValuesSchema,
    };

    return validatePayload(payload, schema);
  }
);

export interface ToggleSelectStaticFilterValueActionCreatorPayload {
  /**
   * The unique identifier for the static filter.
   */
  id: string;

  /**
   * The target static filter value.
   */
  value: StaticFilterValue;
}

export const toggleSelectStaticFilterValue = createAction(
  'staticFilter/toggleSelect',
  (payload: ToggleSelectStaticFilterValueActionCreatorPayload) => {
    const schema = {
      id: staticFilterIdSchema,
      value: staticFilterValueSchema,
    };

    return validatePayload(payload, schema);
  }
);

export const deselectAllStaticFilterValues = createAction(
  'staticFilter/deselectAllFilterValues',
  (payload: string) => {
    return validatePayload(payload, staticFilterIdSchema);
  }
);

export interface LogStaticFilterToggleValueActionCreatorPayload {
  /**
   * The static filter id.
   */
  staticFilterId: string;

  /**
   * The static filter value.
   */
  staticFilterValue: StaticFilterValueMetadata;
}

export interface StaticFilterValueMetadata {
  /**
   * The caption displayed to the user.
   */
  caption: string;

  /**
   * The query expression.
   */
  expression: string;
}

export const logStaticFilterSelect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/staticFilter/select',
    AnalyticsType.Search,
    (client) => client.logStaticFilterSelect(metadata)
  )();

export const logStaticFilterDeselect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/staticFilter/deselect',
    AnalyticsType.Search,
    (client) => client.logStaticFilterDeselect(metadata)
  )();

export interface LogStaticFilterClearAllActionCreatorPayload {
  /**
   * The static filter id.
   */
  staticFilterId: string;
}

export const logStaticFilterClearAll = (
  metadata: LogStaticFilterClearAllActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/staticFilter/clearAll',
    AnalyticsType.Search,
    (client) => client.logStaticFilterClearAll(metadata)
  )();
