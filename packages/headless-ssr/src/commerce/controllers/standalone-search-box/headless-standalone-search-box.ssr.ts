import {
  buildStandaloneSearchBox,
  type StandaloneSearchBox,
  type StandaloneSearchBoxState,
} from '@coveo/headless/commerce';
import type {StandaloneSearchBoxProps} from '@coveo/headless/commerce';
import type {ListingAndStandaloneControllerWithoutProps} from '../../types/controller-definitions.js';

export type {StandaloneSearchBox, StandaloneSearchBoxProps, StandaloneSearchBoxState};

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
