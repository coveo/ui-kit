import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Result} from '@coveo/headless';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicResultList} from '../stencil-generated/search';

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
    resultListRef.current?.setRenderFunction((result, root) => {
      createRoot(root).render(template(result as Result));
      return renderToString(template(result as Result));
    });
  }, [resultListRef]);
  return <AtomicResultList ref={resultListRef} {...otherProps} />;
};
