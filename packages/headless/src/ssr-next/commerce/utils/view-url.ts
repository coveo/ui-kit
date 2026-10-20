import type {CommonBuildConfig} from '../types/build.js';

/**
 * Fills `context.view.url` with `navigatorContext.location` when the page URL was not set explicitly,
 * so that the Commerce API and the analytics report the same page.
 *
 * @throws When neither `context.view.url` nor `navigatorContext.location` is set.
 */
export function withDefaultViewUrl<TBuildConfig extends CommonBuildConfig>(
  buildConfig: TBuildConfig
): TBuildConfig {
  if (buildConfig.context?.view?.url) {
    return buildConfig;
  }

  const location = buildConfig.navigatorContext?.location;
  if (!location) {
    throw new Error(
      'The URL of the page is required: set it in `context.view.url`, or in `navigatorContext.location` to use it for both the Commerce API and the analytics.'
    );
  }

  return {
    ...buildConfig,
    context: {
      ...buildConfig.context,
      view: {...buildConfig.context?.view, url: location},
    },
  };
}
