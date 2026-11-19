import type {SearchEngine} from '@coveo/headless';
import {buildUrlManager, type UrlManager, type UrlManagerInitialState} from '@coveo/headless';
import {MissingControllerProps} from '../../../common/errors.js';
import type {ControllerDefinitionWithProps} from '../../types/controller-definition.js';

export {
  type UrlManagerProps,
  type UrlManagerInitialState,
  type UrlManager,
  type UrlManagerState,
} from '@coveo/headless';

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
