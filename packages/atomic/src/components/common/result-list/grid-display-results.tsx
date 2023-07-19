import {FunctionalComponent, h} from '@stencil/core';
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
        onClick={(event) => {
          event.preventDefault();
          interactiveResult.select();
          window.open(unfoldedResult.clickUri, props.target);
        }}
      >
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
