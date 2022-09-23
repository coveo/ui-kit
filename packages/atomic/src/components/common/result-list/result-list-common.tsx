import {Host, h, FunctionalComponent} from '@stencil/core';
import {getFirstFocusableDescendant} from '../../../utils/accessibility-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {once} from '../../../utils/utils';
import {ResultListInfo} from '../../search/atomic-search-interface/store';
import {
  GridDisplayResultsPlaceholder,
  ListDisplayResultsPlaceholder,
  ResultPlaceholderProps,
  TableDisplayResultsPlaceholder,
} from '../atomic-result-placeholder/placeholders';
import {AnyResult, extractFoldedResult} from '../interface/result';
import {
  getResultDisplayClasses,
  ResultDisplayLayout,
} from '../layout/display-options';
import {GridDisplayResults} from './grid-display-results';
import {ListDisplayResults} from './list-display-results';
import {
  ResultListCommonProps,
  ResultListDisplayProps,
  ResultListRenderer,
} from './result-list-common-interface';
import {TableDisplayResults} from './table-display-results';

export class ResultListCommon implements ResultListRenderer, ResultListInfo {
  private updateBreakpoints?: (host: HTMLElement) => void;
  private indexOfResultToFocus?: number;

  constructor(private props: ResultListCommonProps) {
    this.props.bindings.store.setLoadingFlag(this.props.loadingFlag);
    this.props.bindings.store.registerResultList(this);
    this.addUpdateBreakpointOnce();
  }

  private addUpdateBreakpointOnce() {
    if (!this.props.layoutSelector) {
      return;
    }

    this.updateBreakpoints = once((host: HTMLElement) => {
      updateBreakpoints(host, this.props.layoutSelector!);
    });
  }

  public getResultId(result: AnyResult) {
    return (
      extractFoldedResult(result).uniqueId +
      this.props.getResultListState().searchResponseId
    );
  }

  public setNewResultRef(element: HTMLElement, resultIndex: number) {
    if (resultIndex !== this.indexOfResultToFocus) {
      return;
    }

    if (!element.children.length && !element.shadowRoot?.children.length) {
      return;
    }

    this.indexOfResultToFocus = undefined;
    const elementToFocus = getFirstFocusableDescendant(element) ?? element;
    this.props.nextNewResultTarget.setTarget(elementToFocus);
  }

  public focusOnNextNewResult() {
    this.indexOfResultToFocus = this.props.getResultListState().results.length;
    this.props.nextNewResultTarget.focusOnNextTarget();
  }

  private get displayPlaceholders() {
    return !this.props.bindings.store.isAppLoaded();
  }

  public get listClasses() {
    const classes = getResultDisplayClasses(
      this.props.getDisplay(),
      this.props.getDensity(),
      this.props.getImageSize()
    );

    if (
      this.props.getResultListState().firstSearchExecuted &&
      this.props.getResultListState().isLoading
    ) {
      classes.push('loading');
    }

    if (this.displayPlaceholders) {
      classes.push('placeholder');
    }

    return classes.join(' ');
  }

  public render() {
    this.updateBreakpoints?.(this.props.host);

    if (!this.props.resultTemplateProvider.ready) {
      return;
    }

    if (this.props.getResultListState().hasError) {
      return;
    }

    if (
      this.props.getResultListState().firstSearchExecuted &&
      !this.props.getResultListState().hasResults
    ) {
      return;
    }

    return (
      <Host>
        {this.props.resultTemplateProvider.hasError && <slot></slot>}
        <div class={`list-wrapper ${this.listClasses}`}>
          <ResultDisplayWrapper
            listClasses={this.listClasses}
            display={this.props.getDisplay()}
          >
            {this.displayPlaceholders && (
              <ResultsPlaceholder
                numberOfPlaceholders={this.props.getNumberOfPlaceholders()}
                density={this.props.getDensity()}
                display={this.props.getDisplay()}
                imageSize={this.props.getImageSize()}
              />
            )}
            {this.props.getResultListState().firstSearchExecuted && (
              <ResultListDisplay
                getResultId={(result: AnyResult) => this.getResultId(result)}
                listClasses={this.listClasses}
                setNewResultRef={(...args) => this.setNewResultRef(...args)}
                {...this.props}
              />
            )}
          </ResultDisplayWrapper>
        </div>
      </Host>
    );
  }
}

const ResultDisplayWrapper: FunctionalComponent<{
  display?: ResultDisplayLayout;
  listClasses: string;
}> = (props, children) => {
  if (props.display === 'table') {
    return children;
  }

  return (
    <div class={`list-root ${props.listClasses}`} part="result-list">
      {children}
    </div>
  );
};

const ResultsPlaceholder: FunctionalComponent<ResultPlaceholderProps> = (
  props
) => {
  switch (props.display) {
    case 'table':
      return <TableDisplayResultsPlaceholder {...props} />;
    case 'grid':
      return <GridDisplayResultsPlaceholder {...props} />;
    default:
      return <ListDisplayResultsPlaceholder {...props} />;
  }
};

const ResultListDisplay: FunctionalComponent<ResultListDisplayProps> = (
  props
) => {
  if (!props.getResultListState().results.length) {
    return null;
  }

  switch (props.getDisplay()) {
    case 'table':
      return <TableDisplayResults {...props} />;
    case 'grid':
      return <GridDisplayResults {...props} />;
    default:
      return <ListDisplayResults {...props} />;
  }
};
