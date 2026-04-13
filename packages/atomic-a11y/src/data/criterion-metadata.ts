import type {CriterionMetadata} from '../shared/types.js';
import {wcagCriteriaDefinitions} from './wcag-criteria.js';

const criterionMetadataMap: Record<string, CriterionMetadata> =
  Object.fromEntries(
    wcagCriteriaDefinitions.map((c) => [
      c.id,
      {name: c.handle, level: c.level, wcagVersion: c.wcagVersion},
    ])
  );

export function getCriterionMetadata(
  criterionId: string
): CriterionMetadata | undefined {
  return criterionMetadataMap[criterionId];
}
