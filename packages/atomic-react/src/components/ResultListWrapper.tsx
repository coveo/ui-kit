import React, {useEffect, useRef} from 'react';
import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Result} from '@coveo/atomic/headless';
import {AtomicResultList} from './stencil-generated';
import ReactDOMServer from 'react-dom/server';

interface WrapperProps extends AtomicJSX.AtomicResultList {
  template: (result: Result) => JSX.Element;
}

export const ResultListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const resultListRef = useRef<HTMLAtomicResultListElement>(null);
  useEffect(() => {
    resultListRef.current?.setRenderFunction((result) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = ReactDOMServer.renderToString(template(result));
      return wrapper;
    });
  }, [resultListRef]);
  return <AtomicResultList ref={resultListRef} {...otherProps} />;
};
