import type {CommonBuildConfig, ControllerBuildContext} from '../ssr-next/commerce/types/build.js';
import {SolutionType} from '../ssr-next/commerce/types/controller-constants.js';
import {buildMockNavigatorContext} from './mock-navigator-context.js';

type BuildContextOverrides = Partial<Omit<ControllerBuildContext, 'buildConfig'>> & {
  buildConfig?: Partial<CommonBuildConfig>;
};

/**
 * The context a commerce controller definition is built with: a listing page with the results flag
 * off and the minimal page facts, unless overridden.
 */
export function buildMockCommerceBuildContext(
  overrides: BuildContextOverrides = {}
): ControllerBuildContext {
  const {buildConfig, ...rest} = overrides;
  return {
    solutionType: SolutionType.listing,
    enableResults: {listing: false, search: false},
    ...rest,
    buildConfig: {
      navigatorContext: buildMockNavigatorContext(),
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        view: {url: 'https://example.com'},
      },
      ...buildConfig,
    },
  };
}
