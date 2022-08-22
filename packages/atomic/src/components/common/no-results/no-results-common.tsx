import {h, VNode} from '@stencil/core';
import MagnifyingGlass from '../../../images/magnifying-glass.svg';
import {AnyBindings} from '../interface/bindings';

interface NoResultsProps {
  bindings: AnyBindings;
  searchStatusState: () => {
    firstSearchExecuted: boolean;
    isLoading: boolean;
    hasResults: boolean;
  };
  querySummaryState: () => {
    hasQuery: boolean;
    query: string;
  };
  setAriaLive: (message: string) => void;
}
export class NoResultsCommon {
  constructor(public props: NoResultsProps) {}

  private wrapHighlight(content: string) {
    return `<span class="font-bold" part="highlight">${this.props.bindings.i18n.t(
      'between-quotations',
      {text: escape(content), interpolation: {escapeValue: false}}
    )}</span>`;
  }

  private renderMagnifyingGlass() {
    return (
      <atomic-icon
        part="icon"
        icon={MagnifyingGlass}
        class="my-6 flex flex-col items-center w-1/2 max-w-lg"
      ></atomic-icon>
    );
  }

  private get summary() {
    return this.props.querySummaryState().hasQuery
      ? this.props.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: this.props.querySummaryState().query,
        })
      : this.props.bindings.i18n.t('no-results');
  }

  private renderNoResults() {
    const {hasQuery, query} = this.props.querySummaryState();
    const content = hasQuery
      ? this.props.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: this.wrapHighlight(query),
        })
      : this.props.bindings.i18n.t('no-results');
    return (
      // file deepcode ignore ReactSetInnerHtml: This is not React code.
      <div
        class="my-2 text-2xl font-medium truncate overflow-hidden max-w-full"
        part="no-results"
        innerHTML={content}
      ></div>
    );
  }

  private renderSearchTips() {
    return (
      <div class="my-2 text-lg text-neutral-dark" part="search-tips">
        {this.props.bindings.i18n.t('search-tips')}
      </div>
    );
  }

  public render(child?: VNode[]) {
    const {firstSearchExecuted, isLoading, hasResults} =
      this.props.searchStatusState();
    if (!firstSearchExecuted || isLoading || hasResults) {
      return;
    }

    this.props.setAriaLive(this.summary);

    return [
      <div class="flex flex-col items-center h-full w-full text-on-background">
        {this.renderMagnifyingGlass()}
        {this.renderNoResults()}
        {this.renderSearchTips()}
        {child && child}
      </div>,
      <slot></slot>,
    ];
  }
}
