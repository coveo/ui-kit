import {createSelector} from '@reduxjs/toolkit';
import {AnalyticsState} from '../../features/configuration/configuration-state';
import {VERSION} from '../../utils/version';

export const getAnalyticsSource = createSelector(
  (state: AnalyticsState) => state.source,
  (source) =>
    [`@coveo/headless@${VERSION}`].concat(
      Object.entries(source).map(
        ([frameworkName, frameworkVersion]) =>
          `${frameworkName}@${frameworkVersion}`
      )
    )
);
