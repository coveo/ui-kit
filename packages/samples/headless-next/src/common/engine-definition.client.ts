'use client';

import {engineDefinition} from './engine-definition';

export const {
  SnapshotProvider: SearchSnapshotProvider,
  LiveProvider: LiveSearchProvider,
} = engineDefinition;
export const {
  useSearchBox,
  useResultList,
  useAuthorFacet,
  useSearchParametersManager,
} = engineDefinition.controllers;
