import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {Result} from '@coveo/headless/recommendation';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicRecsList} from '../stencil-generated/search';

/**
 * The properties of the AtomicRecsList component
 */
interface WrapperProps extends AtomicJSX.AtomicRecsList {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (result: Result) => JSX.Element;
}

/**
 * This component serves as a wrapper for the core AtomicRecsList.
 *
 * @param props
 * @returns
 */
export const RecsListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const recsListRef = useRef<HTMLAtomicRecsListElement>(null);
  useEffect(() => {
    recsListRef.current?.setRenderFunction((result, root) => {
      createRoot(root).render(template(result as Result));
      return renderToString(template(result as Result));
    });
  }, [recsListRef]);
  return <AtomicRecsList ref={recsListRef} {...otherProps} />;
};
