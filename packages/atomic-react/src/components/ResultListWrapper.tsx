import React, {useEffect, useRef} from 'react';
import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Result} from '@coveo/atomic/headless';
import {AtomicResultList} from './stencil-generated';
import ReactDOMServer from 'react-dom/server';

/**
 * The properties of the AtomicResultList component
 */
interface WrapperProps extends AtomicJSX.AtomicResultList {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Result) => JSX.Element;
}

/**
 * This component serves as a wrapper for the core AtomicResultList.
 *
 * @param props
 * @returns
 */
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
