import {FunctionalComponent, h} from '@stencil/core';
import {ResultListDisplayProps} from './result-list-common-interface';

export const ListDisplayResults: FunctionalComponent<ResultListDisplayProps> = (
  props
) =>
  props.getResultListState().results.map((result, index) => {
    return (
      <atomic-result
        key={props.getResultId(result)}
        part="outline"
        result={result}
        store={props.bindings.store}
        content={props.getTemplateContent(result)}
        loadingFlag={props.loadingFlag}
        display={props.getDisplay()}
        density={props.getDensity()}
        image-size={props.getImageSize()}
        ref={(element) => props.setNewResultRef(element!, index)}
        renderingFunction={props.getResultRenderingFunction()}
      ></atomic-result>
    );
  });
