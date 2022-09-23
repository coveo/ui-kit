import {buildInteractiveResult, SearchEngine} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithResultAnalytics} from '../../search/result-link/result-link';
import {ResultListDisplayProps} from './result-list-common-interface';
import {extractFoldedResult} from '../interface/result';

export const GridDisplayResults: FunctionalComponent<ResultListDisplayProps> = (
  props
) =>
  props.getResultListState().results.map((result, index) => {
    const unFoldedResult = extractFoldedResult(result);
    // TODO: support any engine in buildInteractiveResult
    const interactiveResult = buildInteractiveResult(
      props.bindings.engine as SearchEngine,
      {
        options: {result: unFoldedResult},
      }
    );

    return (
      <div
        part="result-list-grid-clickable-container outline"
        ref={(element) => props.setNewResultRef(element!, index)}
      >
        <LinkWithResultAnalytics
          part="result-list-grid-clickable"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
          href={unFoldedResult.clickUri}
          target="_self"
          title={unFoldedResult.title}
          tabIndex={-1}
          ariaHidden={true}
        />
        <atomic-result
          key={props.getResultId(result)}
          result={result}
          store={props.bindings.store}
          content={props.getTemplateContent(result)}
          loadingFlag={props.loadingFlag}
          display={props.getDisplay()}
          density={props.getDensity()}
          image-size={props.getImageSize()}
        ></atomic-result>
      </div>
    );
  });
