import {useEffect, FunctionComponent} from 'react';
import {SearchParameterManager as HeadlessSearchParameterManager} from '@coveo/headless';
import {writeSearchParametersToURI} from './search-parameter-serializer';

interface SearchParameterManagerProps {
  controller: HeadlessSearchParameterManager;
}

export const SearchParameterManager: FunctionComponent<SearchParameterManagerProps> = (
  props
) => {
  const {controller} = props;

  useEffect(
    () =>
      controller.subscribe(() =>
        writeSearchParametersToURI(controller.state.parameters)
      ),
    []
  );

  return null;
};

// usage

/**
 * ```ts
 *  const controller = buildSearchParameterManager(engine, {
 *    initialState: {parameters: readSearchParametersFromURI()},
 *  });
 *
 *  <SearchParameterManager controller={controller} />;
 * ```
 */
