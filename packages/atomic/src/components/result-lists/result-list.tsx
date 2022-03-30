import {
  buildInteractiveResult,
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
  Result,
  ResultList as ResultListType,
  ResultListState,
  ResultsPerPageState,
} from '@coveo/headless';
import {FunctionalComponent, h, Host} from '@stencil/core';
import {Bindings} from '../../utils/initialization-utils';
import {updateBreakpoints} from '../../utils/replace-breakpoint';
import {once} from '../../utils/utils';
import {
  getResultDisplayClasses,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../atomic-result/atomic-result-display-options';
import {LinkWithResultAnalytics} from '../result-link/result-link';

interface ResultListProps {
  parent: AtomicResultListBase;
}

interface AtomicResultListBase {
  resultListState: FoldedResultListState | ResultListState;
  templateHasError: boolean;
  host: HTMLElement;
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image: ResultDisplayImageSize;
  resultList: FoldedResultList | ResultListType;
  listWrapperRef?: HTMLDivElement;
  display?: ResultDisplayLayout;
  resultsPerPageState: ResultsPerPageState;
  bindings: Bindings;
  getContentOfResultTemplate(
    result: Result | FoldedResult
  ): HTMLElement | DocumentFragment;
}

function getClasses({
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

export const ResultList: FunctionalComponent<ResultListProps> = (props) => {
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

interface ResultsProps
  extends Pick<
    AtomicResultListBase,
    | 'display'
    | 'density'
    | 'host'
    | 'resultListState'
    | 'bindings'
    | 'imageSize'
    | 'image'
    | 'getContentOfResultTemplate'
  > {
  getId(result: Result | FoldedCollection): string;
  classes: string;
}

const Results: FunctionalComponent<Omit<ResultsProps, 'getId'>> = (props) => {
  const getId = (result: Result | FoldedCollection) => {
    return unfolded(result).uniqueId + props.resultListState.searchResponseId;
  };
  if (!props.resultListState.results.length) {
    return null;
  }
  if (props.display === 'table') {
    return <TableResults {...props} getId={getId} />;
  }
  return <ListResults {...props} getId={getId} />;
};

const ListResults: FunctionalComponent<ResultsProps> = (props) => {
  return props.resultListState.results.map((result) => {
    const content = props.getContentOfResultTemplate(result);

    const atomicResult = (
      <atomic-result
        key={props.getId(result)}
        result={result}
        engine={props.bindings.engine}
        display={props.display}
        density={props.density}
        imageSize={props.imageSize ?? props.image}
        content={content}
      ></atomic-result>
    );

    return props.display === 'grid' ? (
      <LinkWithResultAnalytics
        part="result-list-grid-clickable"
        interactiveResult={buildInteractiveResult(props.bindings.engine, {
          options: {result: unfolded(result)},
        })}
        href={unfolded(result).clickUri}
        target="_self"
      >
        {atomicResult}
      </LinkWithResultAnalytics>
    ) : (
      atomicResult
    );
  });
};

const TableResults: FunctionalComponent<ResultsProps> = (props) => {
  const fieldColumns = Array.from(
    props
      .getContentOfResultTemplate(props.resultListState.results[0])
      .querySelectorAll('atomic-table-element')
  );

  if (fieldColumns.length === 0) {
    props.bindings.engine.logger.error(
      'atomic-table-element elements missing in the result template to display columns.',
      props.host
    );
  }

  return (
    <table class={`list-root ${props.classes}`} part="result-table">
      <thead part="result-table-heading">
        <tr part="result-table-heading-row">
          {fieldColumns.map((column) => (
            <th part="result-table-heading-cell">
              <atomic-text value={column.getAttribute('label')!}></atomic-text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody part="result-table-body">
        {props.resultListState.results.map((result) => (
          <tr key={props.getId(result)} part="result-table-row">
            {fieldColumns.map((column) => {
              return (
                <td
                  key={column.getAttribute('label')! + props.getId(result)}
                  part="result-table-cell"
                >
                  <atomic-result
                    engine={props.bindings.engine}
                    result={result}
                    display={props.display}
                    density={props.density}
                    image-size={props.imageSize ?? props.image}
                    content={column}
                  ></atomic-result>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
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

const ResultsPlaceholder: FunctionalComponent<
  Pick<
    AtomicResultListBase,
    'display' | 'density' | 'imageSize' | 'image' | 'resultsPerPageState'
  >
> = (props) => {
  if (props.display === 'table') {
    return (
      <atomic-result-table-placeholder
        density={props.density}
        imageSize={props.imageSize ?? props.image}
        rows={props.resultsPerPageState.numberOfResults}
      ></atomic-result-table-placeholder>
    );
  }
  return Array.from(
    {length: props.resultsPerPageState.numberOfResults},
    (_, i) => (
      <atomic-result-placeholder
        key={`placeholder-${i}`}
        density={props.density}
        display="list"
        imageSize={props.imageSize ?? props.image}
      ></atomic-result-placeholder>
    )
  );
};

function unfolded(result: Result | FoldedResult): Result {
  return (result as FoldedResult).result || result;
}
