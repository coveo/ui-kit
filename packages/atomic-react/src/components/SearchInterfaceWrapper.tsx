import React, {useEffect, useRef} from 'react';
import type {JSX} from '@coveo/atomic';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/atomic/headless';
import {AtomicSearchInterface} from './stencil-generated/index';

type ExecuteSearch = HTMLAtomicSearchInterfaceElement['executeFirstSearch'];
interface WrapperProps extends JSX.AtomicSearchInterface {
  onReady?: (executeFirstSearch: ExecuteSearch) => Promise<void>;
  theme?: string | 'none';
}

const DefaultProps: Required<
  Pick<WrapperProps, 'onReady' | 'theme' | 'engine'>
> = {
  onReady: (executeFirstSearch) => {
    return executeFirstSearch();
  },
  theme: 'coveo',
  engine: buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  }),
};

export const AtomicSearchInterfaceWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const mergedProps = {...DefaultProps, ...props};
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
