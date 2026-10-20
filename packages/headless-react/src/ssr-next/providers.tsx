'use client';

import type {InferHydratedState, InferStaticState} from '@coveo/headless/ssr-next';
import type {FunctionComponent, PropsWithChildren} from 'react';
import {
  buildProviderWithDefinition as buildSharedProviderWithDefinition,
  type HydratableDefinition,
  type ProviderProps,
} from '../ssr-common/providers.js';
import type {ReactSearchEngineDefinition, SearchControllerDefinitionsMap} from './types.js';

/**
 * Builds the provider of an engine definition: it renders the static state fetched on the server,
 * hydrates it in the browser, and makes the controller hooks work.
 *
 * A hydration failure is thrown during render, so the nearest React error boundary reports it,
 * unless the `onHydrationError` prop handles it.
 *
 * @example
 * ```tsx
 * // components/providers.tsx
 * 'use client';
 * export const SearchProvider = buildProviderWithDefinition(searchEngineDefinition);
 *
 * // app/search/page.tsx (server component)
 * const staticState = await searchEngineDefinition.fetchStaticState({navigatorContext, searchParams});
 * return <SearchProvider staticState={staticState}>...</SearchProvider>;
 * ```
 *
 * @group Providers
 */
export function buildProviderWithDefinition<TControllers extends SearchControllerDefinitionsMap>(
  definition: ReactSearchEngineDefinition<TControllers>
): FunctionComponent<PropsWithChildren<ProviderProps<InferStaticState<typeof definition>>>> {
  return buildSharedProviderWithDefinition(
    definition as unknown as HydratableDefinition<
      InferStaticState<typeof definition>,
      InferHydratedState<typeof definition>
    >
  );
}
