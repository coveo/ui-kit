import React, {useEffect, useRef} from 'react';
import {AtomicSearchInterface} from './stencil-generated/index';

interface WrapperProps {
  onReady?: () => void;
}

export const AtomicSearchInterfaceWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const searchInterfaceRef = useRef(null);
  useEffect(() => {
    // TODO
    (
      searchInterfaceRef.current as unknown as HTMLAtomicSearchInterfaceElement
    ).executeFirstSearch();
  }, [searchInterfaceRef]);
  return (
    <AtomicSearchInterface ref={searchInterfaceRef}>
      {props.children}
    </AtomicSearchInterface>
  );
};
