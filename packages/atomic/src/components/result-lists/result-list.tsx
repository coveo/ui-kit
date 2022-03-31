import {FunctionalComponent, h, Host} from '@stencil/core';
import {updateBreakpoints} from '../../utils/replace-breakpoint';
import {once} from '../../utils/utils';
import {
  getResultDisplayClasses,
  ResultDisplayLayout,
} from '../atomic-result/atomic-result-display-options';
import {AtomicResultListBase, ResultsProps} from './result-list-common';
import {ResultsPlaceholder} from './results-placeholder';
import {TableDisplayResults} from './table-display-results';
import {ListDisplayResults} from './list-display-results';
interface ResultListProps {
  parent: AtomicResultListBase;
}

export const BaseResultList: FunctionalComponent<ResultListProps> = (props) => {
  const parent = props.parent;
  const updateBreakpointsOnce = once(() => updateBreakpoints(parent.host));
  updateBreakpointsOnce();

  if (parent.resultListState.hasError) {
    return;
  }

  const classes = getClasses(props.parent);
  return (
    <Host>
      {parent.templateHasError && <slot></slot>}
      <div
        class={`list-wrapper placeholder ${classes}`}
        ref={(el) => (parent.listWrapperRef = el as HTMLDivElement)}
      >
        <ResultDisplayWrapper classes={classes} display={parent.display}>
          <ResultsPlaceholder
            display={parent.display}
            density={parent.density}
            imageSize={parent.imageSize}
            image={parent.image}
            resultsPerPageState={parent.resultsPerPageState}
          />
          <Results
            classes={classes}
            bindings={parent.bindings}
            host={parent.host}
            display={parent.display}
            density={parent.density}
            image={parent.image}
            resultListState={parent.resultListState}
            getContentOfResultTemplate={parent.getContentOfResultTemplate.bind(
              parent
            )}
          />
        </ResultDisplayWrapper>
      </div>
    </Host>
  );
};

const ResultDisplayWrapper: FunctionalComponent<{
  display?: ResultDisplayLayout;
  classes: string;
}> = (props, children) => {
  if (props.display === 'table') {
    return children;
  }
  return (
    <div class={`list-root ${props.classes}`} part="result-list">
      {children}
    </div>
  );
};

const Results: FunctionalComponent<ResultsProps> = (props) => {
  if (!props.resultListState.results.length) {
    return null;
  }
  if (props.display === 'table') {
    return <TableDisplayResults {...props} />;
  }
  return <ListDisplayResults {...props} />;
};

export function getClasses({
  display = 'list',
  density,
  imageSize,
  image,
  resultListState,
  resultList,
}: AtomicResultListBase): string {
  const classes = getResultDisplayClasses(display, density, imageSize ?? image);
  if (resultListState.firstSearchExecuted && resultList.state.isLoading) {
    classes.push('loading');
  }
  return classes.join(' ');
}
