import {h, FunctionalComponent, Fragment} from '@stencil/core';
import {getFirstFocusableDescendant} from '../../../utils/accessibility-utils';
import {defer} from '../../../utils/utils';
import {
  ResultsPlaceholder,
  ResultPlaceholderProps,
  TableDisplayResultsPlaceholder,
} from '../atomic-result-placeholder/placeholders';
import {AnyResult, extractUnfoldedResult} from '../interface/result';
import {ResultListInfo} from '../interface/store';
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

export const resultComponentClass = 'result-component';

export class ResultListCommon<SpecificResult extends AnyResult = AnyResult>
  implements ResultListRenderer, ResultListInfo
{
  private indexOfResultToFocus?: number;
  private firstResultEl?: HTMLElement;

  constructor(private props: ResultListCommonProps<SpecificResult>) {
    this.props.bindings.store.setLoadingFlag(this.props.loadingFlag);
    this.props.bindings.store.registerResultList(this);
  }

  public getResultId(result: AnyResult) {
    return `${extractUnfoldedResult(result).uniqueId}${
      this.props.getResultListState().searchResponseId
    }${this.props.getDensity()}${this.props.getImageSize()}`;
  }

  public setNewResultRef(element: HTMLElement, resultIndex: number) {
    if (resultIndex === 0) {
      this.firstResultEl = element;
    }
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

  public async focusOnFirstResultAfterNextSearch() {
    await defer();
    return new Promise<void>((resolve) => {
      if (this.props.getResultListState().isLoading) {
        this.firstResultEl = undefined;
      }

      const unsub = this.props.bindings.engine.subscribe(async () => {
        await defer();
        if (!this.props.getResultListState().isLoading && this.firstResultEl) {
          const elementToFocus =
            getFirstFocusableDescendant(this.firstResultEl) ??
            this.firstResultEl;
          this.props.nextNewResultTarget.setTarget(elementToFocus);
          this.props.nextNewResultTarget.focus();
          this.firstResultEl = undefined;
          unsub();
          resolve();
        }
      });
    });
  }

  private get displayPlaceholders() {
    return !this.props.bindings.store.isAppLoaded();
  }

  public get listClasses() {
    const classes = getResultDisplayClasses(
      this.props.getLayoutDisplay(),
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
    /*if (!this.props.resultTemplateProvider.templatesRegistered) {
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
    }*/

    return (
      <Fragment>
        {this.props.resultTemplateProvider.hasError && <slot></slot>}
        <div class={`list-wrapper ${this.listClasses}`}>
          <ResultDisplayWrapper
            listClasses={this.listClasses}
            display={this.props.getLayoutDisplay()}
          >
            {this.displayPlaceholders && (
              <DisplayResultsPlaceholder
                numberOfPlaceholders={this.props.getNumberOfPlaceholders()}
                density={this.props.getDensity()}
                display={this.props.getResultDisplay()}
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
      </Fragment>
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

const DisplayResultsPlaceholder: FunctionalComponent<ResultPlaceholderProps> = (
  props
) => {
  switch (props.display) {
    case 'table':
      return <TableDisplayResultsPlaceholder {...props} />;
    default:
      return <ResultsPlaceholder {...props} />;
  }
};

const ResultListDisplay: FunctionalComponent<ResultListDisplayProps> = (
  props
) => {
  if (!props.getResultListState().results.length) {
    return null;
  }

  switch (props.getLayoutDisplay()) {
    case 'table':
      return <TableDisplayResults {...props} />;
    case 'grid':
      return <GridDisplayResults {...props} />;
    default:
      return <ListDisplayResults {...props} />;
  }
};
