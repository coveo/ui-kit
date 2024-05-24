import type {JSX, i18n} from '@coveo/atomic';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import React, {useEffect, useRef} from 'react';
import {AtomicSearchInterface} from '../stencil-generated/search';

type ExecuteSearch = HTMLAtomicSearchInterfaceElement['executeFirstSearch'];
/**
 * The properties of the AtomicSearchInterface component
 */
interface WrapperProps
  extends Omit<JSX.AtomicSearchInterface, 'i18n' | 'pipeline' | 'searchHub'> {
  /**
   * An optional callback function that can be used to control the execution of the first query.
   *
   * If not provided, a default function will be used, which execute the first query immediately after initialization.
   */
  onReady?: (executeFirstSearch: ExecuteSearch) => Promise<void>;
  /**
   * An optional callback that lets you control the interface localization.
   *
   * The function receives the search interface 18n instance, which you can then modify (see [Localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/)).
   *
   */
  localization?: (i18n: i18n) => void;
  /**
   * @deprecated This option has no effect. Rather, set the pipeline through the `engine` `search` configuration.
   */
  pipeline?: string;
  /**
   * @deprecated This option has no effect. Rather, set the search hub through the `engine` `search` configuration.
   */
  searchHub?: string;
}

const DefaultProps: Required<Pick<WrapperProps, 'onReady' | 'localization'>> = {
  onReady: (executeFirstSearch) => {
    return executeFirstSearch();
  },
  localization: () => {},
};

/**
 * This component serves as a wrapper for the core AtomicSearchInterface.
 * @param props
 * @returns
 */
export const SearchInterfaceWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const mergedProps = {...DefaultProps, ...props};
  if (!mergedProps.engine) {
    mergedProps.engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });
  }
  const {engine, localization, onReady, ...allOtherProps} = mergedProps;
  const searchInterfaceRef = useRef<HTMLAtomicSearchInterfaceElement>(null);
  let initialization: Promise<void> | null = null;

  useEffect(() => {
    const searchInterfaceAtomic = searchInterfaceRef.current!;
    if (!initialization) {
      initialization = searchInterfaceAtomic.initializeWithSearchEngine(engine);
      initialization.then(() => {
        localization(searchInterfaceAtomic.i18n);
        onReady(
          searchInterfaceAtomic.executeFirstSearch.bind(searchInterfaceAtomic)
        );
      });
    }
  }, [searchInterfaceRef]);

  return (
    <AtomicSearchInterface ref={searchInterfaceRef} {...allOtherProps}>
      {props.children}
    </AtomicSearchInterface>
  );
};
