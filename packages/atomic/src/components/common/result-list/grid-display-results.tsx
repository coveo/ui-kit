import {buildInteractiveResult, SearchEngine} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {AnyBindings} from '../interface/bindings';
import {LinkWithResultAnalytics} from '../../search/result-link/result-link';
import {ResultsProps} from './result-list-common';

export const GridDisplayResults: FunctionalComponent<
  ResultsProps<AnyBindings>
> = (props) => {
  return props.resultListState.results.map((result, index) => {
    // TODO: support proper engine
    const interactiveResult = buildInteractiveResult(
      props.bindings.engine as SearchEngine,
      {
        options: {result: props.resultListCommon.getUnfoldedResult(result)},
      }
    );

    return (
      <div
        part="result-list-grid-clickable-container outline"
        ref={(element) =>
          element &&
          props.indexOfResultToFocus === index &&
          props.newResultRef?.(element)
        }
      >
        <LinkWithResultAnalytics
          part="result-list-grid-clickable"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
          href={props.resultListCommon.getUnfoldedResult(result).clickUri}
          target="_self"
          title={props.resultListCommon.getUnfoldedResult(result).title}
          tabIndex={-1}
          ariaHidden={true}
        />
        <atomic-result
          key={props.resultListCommon.getResultId(
            result,
            props.resultListState
          )}
          result={result}
          store={props.bindings.store}
          content={props.getContentOfResultTemplate(result)}
          loadingFlag={props.resultListCommon.loadingFlag}
          {...props}
        ></atomic-result>
      </div>
    );
  });
};
