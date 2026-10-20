'use client';

import type {
  Controller,
  ControllerDefinitionsMap,
  InferHydratedState,
  InferStaticState,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import type {FunctionComponent, PropsWithChildren} from 'react';
import {
  buildProviderWithDefinition as buildSharedProviderWithDefinition,
  type HydratableDefinition,
  type ProviderProps,
} from '../ssr-common/providers.js';
import type {ReactCommerceEngineDefinition} from './commerce-engine.js';

/**
 * Providers take care of displaying your page with the static
 * state, and then hydrating the state and displaying the page
 * with the hydrated state. They are required for your controller hooks to function.
 *
 * A hydration failure is thrown during render, so the nearest React error boundary reports it,
 * unless the `onHydrationError` prop handles it.
 *
 * See [Create providers](https://docs.coveo.com/en/obif0156/#create-providers).
 *
 * @group Providers
 */
export function buildProviderWithDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  definition: ReactCommerceEngineDefinition<TControllers, TSolutionType>
): FunctionComponent<PropsWithChildren<ProviderProps<InferStaticState<typeof definition>>>> {
  return buildSharedProviderWithDefinition(
    definition as unknown as HydratableDefinition<
      InferStaticState<typeof definition>,
      InferHydratedState<typeof definition>
    >
  );
}
