import React, {useEffect, useRef} from 'react';
import type {JSX as AtomicJSX} from '@coveo/atomic';
import type {FoldedResult, Result} from '@coveo/atomic/headless';
import {AtomicSearchBoxInstantResults} from './stencil-generated';
import ReactDOMServer from 'react-dom/server';

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
    instantResultsRef.current?.setRenderFunction(
      (result: Result | FoldedResult) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = ReactDOMServer.renderToString(template(result));
        return wrapper;
      }
    );
  }, [instantResultsRef]);
  return (
    <AtomicSearchBoxInstantResults ref={instantResultsRef} {...otherProps} />
  );
};
