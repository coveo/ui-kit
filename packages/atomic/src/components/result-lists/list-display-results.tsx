import {FunctionalComponent, h} from '@stencil/core';
import {ResultsProps} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result, index) => {
    const sharedPropsBetweenBothMode = {
      key: props.resultListCommon.getResultId(result, props.resultListState),
      part: 'outline',
      result,
      engine: props.bindings.engine,
      store: props.bindings.store,
      loadingFlag: props.resultListCommon.loadingFlag,
      ref: (element: HTMLElement) => {
        element &&
          props.indexOfResultToFocus === index &&
          props.newResultRef?.(element);
      },
      ...props,
    };

    if (props.renderingFunction) {
      return (
        <atomic-result
          renderingFunction={props.renderingFunction}
          {...sharedPropsBetweenBothMode}
        ></atomic-result>
      );
    }

    return (
      <atomic-result
        content={props.getContentOfResultTemplate(result)}
        {...sharedPropsBetweenBothMode}
      ></atomic-result>
    );
  });
};
