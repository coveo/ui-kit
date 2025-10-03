import type {Bindings} from '@coveo/atomic';
import type {FoldedResult, Result} from '@coveo/headless';
// biome-ignore lint/style/useImportType: <React is needed>
import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';

import '@coveo/atomic/loader';

/**
 * Properties for the AtomicSearchBoxInstantResults component
 */
interface AtomicSearchBoxInstantResultsProps {
  /**
   * The maximum number of results to show.
   */
  'max-results-per-query'?: number;
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  density?: 'comfortable' | 'normal' | 'compact';
  /**
   * The expected size of the image displayed in the results.
   */
  'image-size'?: 'icon' | 'small' | 'large' | 'none';
  /**
   * The callback to generate an aria-label for a given result so that accessibility tools can fully describe what's visually rendered by a result.
   */
  ariaLabelGenerator?: (
    bindings: Bindings,
    result: Result
  ) => string | undefined;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'atomic-search-box-instant-results': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> &
          Omit<AtomicSearchBoxInstantResultsProps, 'ariaLabelGenerator'>,
        HTMLElement
      >;
    }
  }
}

/**
 * The properties of the AtomicSearchBoxInstantResults component
 */
interface WrapperProps extends AtomicSearchBoxInstantResultsProps {
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
  const {template, ariaLabelGenerator, ...otherProps} = props;
  const instantResultsRef = useRef<
    HTMLElement & {
      setRenderFunction: (
        fn: (result: Result, root: HTMLElement) => string
      ) => void;
      ariaLabelGenerator?: (
        bindings: Bindings,
        result: Result
      ) => string | undefined;
    }
  >(null);

  useEffect(() => {
    instantResultsRef.current?.setRenderFunction((result, root) => {
      createRoot(root).render(template(result as Result));
      return renderToString(template(result as Result));
    });
  }, [template]);

  useEffect(() => {
    if (instantResultsRef.current && ariaLabelGenerator) {
      instantResultsRef.current.ariaLabelGenerator = ariaLabelGenerator;
    }
  }, [ariaLabelGenerator]);

  return (
    <atomic-search-box-instant-results
      ref={instantResultsRef}
      {...otherProps}
    />
  );
};
