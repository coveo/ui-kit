import {
  buildStandaloneSearchBox,
  type StandaloneSearchBox,
  type StandaloneSearchBoxState,
} from '../../../../controllers/commerce/standalone-search-box/headless-standalone-search-box.js';
import type {StandaloneSearchBoxProps} from '../../../../controllers/standalone-search-box/headless-standalone-search-box.js';
import type {ListingAndStandaloneControllerWithoutProps} from '../../types/controller-definitions.js';

export type {
  StandaloneSearchBoxState,
  StandaloneSearchBox,
  StandaloneSearchBoxProps,
};

export type StandaloneSearchBoxDefinition =
  ListingAndStandaloneControllerWithoutProps<StandaloneSearchBox>;

/**
 * Defines the `StandaloneSearchBox` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The configurable `StandaloneSearchBox` properties.
 * @returns The `StandaloneSearchBox` controller definition.
 */
export function defineStandaloneSearchBox(
  props: StandaloneSearchBoxProps
): StandaloneSearchBoxDefinition {
  return {
    listing: true,
    standalone: true,
    build: (engine) => buildStandaloneSearchBox(engine, props),
  };
}
