import type {RelativeDatePeriod, RelativeDateUnit} from '@coveo/headless';

/**
 * Interface representing a timeframe configuration for date facets.
 */
export interface Timeframe {
  period: RelativeDatePeriod;
  unit?: RelativeDateUnit;
  amount?: number;
  label?: string;
}

/**
 * Shared utilities and types for timeframe facet components.
 * This module provides common functionality for both Search and Insight timeframe facets.
 *
 * For Stencil components, use the class-based implementation from stencil-timeframe-facet-common.tsx.
 * For Lit components, implement timeframe logic directly in the component following the pattern
 * of atomic-commerce-timeframe-facet.ts.
 */
