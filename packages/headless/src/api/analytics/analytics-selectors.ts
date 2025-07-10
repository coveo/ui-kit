import {createSelector} from '@reduxjs/toolkit';
import type {CoreAnalyticsState} from '../../features/configuration/configuration-state.js';
import {VERSION} from '../../utils/version.js';

export const getAnalyticsSource = createSelector(
  (state: CoreAnalyticsState) => state.source,
  (source) =>
    Object.entries(source)
      .map(
        ([frameworkName, frameworkVersion]) =>
          `${frameworkName}@${frameworkVersion}`
      )
      .concat(`@coveo/headless@${VERSION}`)
);
