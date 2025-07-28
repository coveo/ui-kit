import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildUrlManager,
  type UrlManager,
  type UrlManagerInitialState,
} from '../../../../controllers/url-manager/headless-url-manager.js';
import {MissingControllerProps} from '../../../../utils/errors.js';
import type {ControllerDefinitionWithProps} from '../../../common/types/common.js';

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
    if (props === undefined) {
      throw new MissingControllerProps('UrlManager');
    }
    return buildUrlManager(engine, {initialState: props.initialState});
  },
});
