import type {i18n} from '@coveo/atomic';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
// oxlint-disable-next-line @typescript-eslint/consistent-type-imports -- <React is needed>
import React, {useEffect, useRef} from 'react';
import {AtomicSearchInterface} from './components.js';

type AtomicSearchInterfaceProps = React.ComponentProps<
  typeof AtomicSearchInterface
>;

type ExecuteSearch = AtomicSearchInterfaceProps['executeFirstSearch'];
/**
 * The properties of the AtomicSearchInterface component
 */
interface WrapperProps extends Omit<
  AtomicSearchInterfaceProps,
  'i18n' | 'pipeline' | 'searchHub' | 'analytics'
> {
  /**
   * An optional callback function that can be used to control the execution of the first query.
   *
   * If not provided, a default function will be used, which execute the first query immediately after initialization.
   */
  onReady?: (executeFirstSearch: ExecuteSearch) => Promise<void>;
  /**
   * An optional callback that lets you control the interface localization.
   *
   * The function receives the search interface 18n instance, which you can then modify (see [Localization](https://static.cloud.coveo.com/atomic/v3/storybook/index.html?path=/docs/usage-additional-topics-localization--docs)).
   *
   */
  localization?: (i18n: i18n) => void;
}

const DefaultProps: Required<Pick<WrapperProps, 'onReady' | 'localization'>> = {
  onReady: (executeFirstRequest) => {
    return executeFirstRequest ? executeFirstRequest() : Promise.resolve();
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
  const searchInterfaceRef =
    useRef<React.ElementRef<typeof AtomicSearchInterface>>(null);
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
  }, [engine, initialization, localization, onReady]);

  return (
    <AtomicSearchInterface ref={searchInterfaceRef} {...allOtherProps}>
      {props.children}
    </AtomicSearchInterface>
  );
};
