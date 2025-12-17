import type {AtomicFoldedResultList} from '@coveo/atomic/components';
import type {FoldedResult} from '@coveo/headless';
import React, {type JSX, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicFoldedResultList as LitAtomicFoldedResultList} from './components.js';

/**
 * The properties of the AtomicFoldedResultList component
 */
interface WrapperProps {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (foldedResult: FoldedResult) => JSX.Element;
}

/**
 * This component serves as a wrapper for the core AtomicResultList.
 *
 * @param props
 * @returns
 */
export const FoldedResultListWrapper: React.FC<WrapperProps> = (props) => {
  const {template, ...otherProps} = props;
  const foldedResultListRef = useRef<AtomicFoldedResultList>(null);
  useEffect(() => {
    foldedResultListRef.current?.setRenderFunction((foldedResult, root) => {
      createRoot(root).render(template(foldedResult as FoldedResult));
      return renderToString(template(foldedResult as FoldedResult));
    });
  }, [template]);
  return (
    <LitAtomicFoldedResultList ref={foldedResultListRef} {...otherProps} />
  );
};
