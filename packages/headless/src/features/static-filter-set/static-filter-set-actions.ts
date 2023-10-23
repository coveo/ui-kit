import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';
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

export const toggleExcludeStaticFilterValue = createAction(
  'staticFilter/toggleExclude',
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
): SearchAction =>
  makeAnalyticsAction('analytics/staticFilter/select', (client) =>
    client.makeStaticFilterSelect(metadata)
  );

export const logStaticFilterDeselect = (
  metadata: LogStaticFilterToggleValueActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction('analytics/staticFilter/deselect', (client) =>
    client.makeStaticFilterDeselect(metadata)
  );

export interface LogStaticFilterClearAllActionCreatorPayload {
  /**
   * The static filter id.
   */
  staticFilterId: string;
}

export const logStaticFilterClearAll = (
  metadata: LogStaticFilterClearAllActionCreatorPayload
): SearchAction =>
  makeAnalyticsAction('analytics/staticFilter/clearAll', (client) =>
    client.makeStaticFilterClearAll(metadata)
  );
