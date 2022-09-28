import {FunctionalComponent} from '@stencil/core';
import {ResultListDisplayProps} from './result-list-common-interface';

export const ListDisplayResults: FunctionalComponent<ResultListDisplayProps> = (
  props
) =>
  props.getResultListState().results.map((result, index) =>
    props.renderResult({
      key: props.getResultId(result),
      part: 'outline',
      result: result,
      store: props.bindings.store,
      content: props.resultTemplateProvider.getTemplateContent(result),
      loadingFlag: props.loadingFlag,
      display: props.getDisplay(),
      density: props.getDensity(),
      imageSize: props.getImageSize(),
      ref: (element) => props.setNewResultRef(element!, index),
      renderingFunction: props.getResultRenderingFunction(),
    })
  );
