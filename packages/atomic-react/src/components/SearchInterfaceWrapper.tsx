import React, {useEffect, useRef} from 'react';
import type {JSX} from '@coveo/atomic';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/atomic/headless';
import {AtomicSearchInterface} from './stencil-generated/index';

type ExecuteSearch = HTMLAtomicSearchInterfaceElement['executeFirstSearch'];
/**
 * The properties of the AtomicSearchInterface component
 */
interface WrapperProps extends JSX.AtomicSearchInterface {
  /**
   * An optional callback function that can be used to control the execution of the first query.
   *
   * If not provided, a default function will be used, to execute the first query immediately after initialization.
   */
  onReady?: (executeFirstSearch: ExecuteSearch) => Promise<void>;
  /**
   * An optional `theme` property can be set in order to load one of the premade Coveo theme.
   *
   * Currently, possible values are`coveo`, `accessible` and `none`.
   *
   * - `coveo` is the default theme, and will be used if no value is provided. It consist of a set of color that matches the Coveo brand.
   * - `accessible` is a high contrast theme, best suited for implementations where web accessibility is important.
   * - `none` means that no premade theme will be loaded. You will have to provide the theme yourself.
   *
   * Read more about theming and visual customization here : https://docs.coveo.com/en/atomic/latest/usage/themes-and-visual-customization/
   */
  theme?: string | 'none';
}

const DefaultProps: Required<Pick<WrapperProps, 'onReady' | 'theme'>> = {
  onReady: (executeFirstSearch) => {
    return executeFirstSearch();
  },
  theme: 'coveo',
};

/**
 * This component serves as a wrapper for the core AtomicSearchInterface
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
  const {engine, theme, onReady, ...allOtherProps} = mergedProps;
  const searchInterfaceRef = useRef<HTMLAtomicSearchInterfaceElement>(null);
  if (theme !== 'none') {
    import(`@coveo/atomic/dist/atomic/themes/${theme}.css`);
  }

  useEffect(() => {
    const searchInterfaceAtomic = searchInterfaceRef.current!;
    searchInterfaceAtomic.initialize(engine.state.configuration).then(() => {
      onReady(
        searchInterfaceAtomic.executeFirstSearch.bind(searchInterfaceAtomic)
      );
    });
  }, [searchInterfaceRef]);

  return (
    <AtomicSearchInterface ref={searchInterfaceRef} {...allOtherProps}>
      {props.children}
    </AtomicSearchInterface>
  );
};
