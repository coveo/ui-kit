import type {ContextOptions} from '../controllers/context/headless-context.ssr.js';
import type {CommonBuildConfig} from '../types/build.js';

/**
 * A build configuration whose `context.view.url` is set.
 */
export type WithViewUrl<TBuildConfig extends CommonBuildConfig> = TBuildConfig & {
  context: ContextOptions;
};

/**
 * Fills `context.view.url` with `navigatorContext.location` when the page URL was not set explicitly,
 * so that the Commerce API and the analytics report the same page.
 *
 * @throws When neither `context.view.url` nor `navigatorContext.location` is set.
 */
export function withDefaultViewUrl<TBuildConfig extends CommonBuildConfig>(
  buildConfig: TBuildConfig
): WithViewUrl<TBuildConfig> {
  const url = buildConfig.context?.view?.url || buildConfig.navigatorContext?.location;
  if (!url) {
    throw new Error(
      'The URL of the page is required: set it in `context.view.url`, or in `navigatorContext.location` to use it for both the Commerce API and the analytics.'
    );
  }

  return {...buildConfig, context: {...buildConfig.context, view: {url}}};
}
