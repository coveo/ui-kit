import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithResultAnalytics} from '../../search/result-link/result-link';
import {extractUnfoldedResult} from '../interface/result';
import {ResultListDisplayProps} from './result-list-common-interface';

export const GridDisplayResults: FunctionalComponent<ResultListDisplayProps> = (
  props
) =>
  props.getResultListState().results.map((result, index) => {
    const unfoldedResult = extractUnfoldedResult(result);
    const interactiveResult = props.getInteractiveResult(unfoldedResult);

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
          href={unfoldedResult.clickUri}
          target="_self"
          title={unfoldedResult.title}
          tabIndex={-1}
          ariaHidden={true}
        />
        {props.renderResult({
          key: props.getResultId(result),
          result: result,
          interactiveResult: props.getInteractiveResult(unfoldedResult),
          store: props.bindings.store,
          content: props.resultTemplateProvider.getTemplateContent(result),
          loadingFlag: props.loadingFlag,
          display: props.getResultDisplay(),
          density: props.getDensity(),
          imageSize: props.getImageSize(),
          renderingFunction: props.getResultRenderingFunction(),
        })}
      </div>
    );
  });
