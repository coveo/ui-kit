import {createSelector} from '@reduxjs/toolkit';
import {CoreAnalyticsState} from '../../features/configuration/configuration-state';
import {VERSION} from '../../utils/version';

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
