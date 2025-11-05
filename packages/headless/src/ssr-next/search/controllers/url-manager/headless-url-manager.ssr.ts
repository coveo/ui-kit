import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildUrlManager,
  type UrlManager,
  type UrlManagerInitialState,
} from '../../../../controllers/url-manager/headless-url-manager.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {ControllerDefinitionWithProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/url-manager/headless-url-manager.js';

/**
 * @internal
 */
export interface UrlManagerBuildProps {
  initialState: UrlManagerInitialState;
}

/**
 * @internal
 * @group Definers
 *
 */
export const defineUrlManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  UrlManager,
  UrlManagerBuildProps
> => ({
  buildWithProps: (engine, props) => {
    // TODO: KIT-5154 - Apply commerce pattern
    if (props === undefined) {
      throw new MissingControllerProps('UrlManager');
    }
    return buildUrlManager(engine, {initialState: props.initialState});
  },
});
