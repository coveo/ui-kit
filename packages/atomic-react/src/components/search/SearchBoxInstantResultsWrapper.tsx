import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {FoldedResult, Result} from '@coveo/headless';
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicSearchBoxInstantResults} from '../stencil-generated/search/components';

/**
 * The properties of the AtomicSearchBoxInstantResults component
 */
interface WrapperProps extends AtomicJSX.AtomicSearchBoxInstantResults {
  /**
   * A template function that takes a result item and outputs its target rendering as a JSX element.
   * It can be used to conditionally render different type of result templates based on the properties of each result.
   */
  template: <T = Result | FoldedResult>(result: T) => JSX.Element;
}

/**
 * This component serves as a wrapper for the core AtomicSearchBoxInstantResults.
 *
 * @param props
 * @returns
 */
export const SearchBoxInstantResultsWrapper: React.FC<WrapperProps> = (
  props
) => {
  const {template, ...otherProps} = props;
  const instantResultsRef =
    useRef<HTMLAtomicSearchBoxInstantResultsElement>(null);
  useEffect(() => {
    instantResultsRef.current?.setRenderFunction((result, root) => {
      createRoot(root).render(template(result as Result));
      return renderToString(template(result as Result));
    });
  }, [instantResultsRef]);
  return (
    <AtomicSearchBoxInstantResults ref={instantResultsRef} {...otherProps} />
  );
};
