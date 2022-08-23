import React, {useEffect, useRef} from 'react';
import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {FoldedResult} from '@coveo/atomic/headless';
import {
  AtomicFoldedResultList,
  AtomicResultChildren,
} from './stencil-generated';
import {renderToString} from 'react-dom/server';
import {createRoot} from 'react-dom/client';

interface TemplateProp {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: (foldedResult: FoldedResult) => JSX.Element;
}

/**
 * The properties of the AtomicFoldedResultList component
 */
interface FoldedResultListWrapperProps
  extends AtomicJSX.AtomicFoldedResultList,
    TemplateProp {}

/**
 * The properties of the AtomicResultChildren component
 */
interface ResultChildrenWrapperProps
  extends AtomicJSX.AtomicFoldedResultList,
    TemplateProp {}

/**
 * This component serves as a wrapper for the core AtomicResultList.
 *
 * @param props
 * @returns
 */
export const FoldedResultListWrapper: React.FC<FoldedResultListWrapperProps> = (
  props
) => {
  const {template, ...otherProps} = props;
  const foldedResultListRef = useRef<HTMLAtomicFoldedResultListElement>(null);
  useEffect(() => {
    foldedResultListRef.current?.setRenderFunction((foldedResult, root) => {
      createRoot(root).render(template(foldedResult as FoldedResult));
      return renderToString(template(foldedResult as FoldedResult));
    });
  }, [foldedResultListRef]);
  return <AtomicFoldedResultList ref={foldedResultListRef} {...otherProps} />;
};

/**
 * This component serves as a wrapper for the core AtomicResultList.
 *
 * @param props
 * @returns
 */
export const ResultChildrenWrapper: React.FC<ResultChildrenWrapperProps> = (
  props
) => {
  const {template, ...otherProps} = props;
  const resultChildrenRef = useRef<HTMLAtomicResultChildrenElement>(null);
  useEffect(() => {
    resultChildrenRef.current?.setRenderFunction((foldedResult, root) => {
      createRoot(root).render(template(foldedResult as FoldedResult));
      return renderToString(template(foldedResult as FoldedResult));
    });
  }, [resultChildrenRef]);
  return <AtomicResultChildren ref={resultChildrenRef} {...otherProps} />;
};
