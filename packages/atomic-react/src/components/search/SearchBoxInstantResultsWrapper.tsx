import type {Bindings} from '@coveo/atomic';
import type {Result} from '@coveo/headless';
import React, {type JSX, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {AtomicSearchBoxInstantResults} from './components.js';

interface WrapperProps {
  maxResultsPerQuery?: number;
  density?: 'comfortable' | 'normal' | 'compact';
  imageSize?: 'icon' | 'small' | 'large' | 'none';
  template: (result: Result) => JSX.Element;
  ariaLabelGenerator?: (
    bindings: Bindings,
    result: Result
  ) => string | undefined;
}

export const SearchBoxInstantResultsWrapper: React.FC<WrapperProps> = ({
  maxResultsPerQuery,
  density,
  imageSize,
  template,
  ariaLabelGenerator,
}) => {
  const ref = useRef<
    HTMLElement & {
      setRenderFunction?: (
        fn: (result: Result, root: HTMLElement) => string
      ) => void;
      ariaLabelGenerator?: (
        bindings: Bindings,
        result: Result
      ) => string | undefined;
    }
  >(null);

  useEffect(() => {
    if (ref.current?.setRenderFunction) {
      ref.current.setRenderFunction((result: Result, root: HTMLElement) => {
        createRoot(root).render(template(result));
        return renderToString(template(result));
      });
    }
  }, [template]);

  useEffect(() => {
    if (ref.current && ariaLabelGenerator) {
      ref.current.ariaLabelGenerator = ariaLabelGenerator;
    }
  }, [ariaLabelGenerator]);

  return (
    <AtomicSearchBoxInstantResults
      // biome-ignore lint/suspicious/noExplicitAny: Ref typing for web component
      ref={ref as any}
      maxResultsPerQuery={maxResultsPerQuery}
      imageSize={imageSize}
      density={density}
    />
  );
};
