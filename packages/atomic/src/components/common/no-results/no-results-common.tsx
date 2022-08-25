import {h, VNode, FunctionalComponent} from '@stencil/core';
import MagnifyingGlass from '../../../images/magnifying-glass.svg';
import {AnyBindings} from '../interface/bindings';

interface NoResultsProps {
  bindings: AnyBindings;
  searchStatusState: {
    firstSearchExecuted: boolean;
    isLoading: boolean;
    hasResults: boolean;
  };
  querySummaryState: {
    hasQuery: boolean;
    query: string;
  };
  setAriaLive: (message: string) => void;
}
export const NoResultsCommon: FunctionalComponent<NoResultsProps> = (
  props,
  children
) => {
  const wrapHighlight = (content: string) => {
    return `<span class="font-bold" part="highlight">${props.bindings.i18n.t(
      'between-quotations',
      {text: escape(content), interpolation: {escapeValue: false}}
    )}</span>`;
  };

  const renderMagnifyingGlass = (): VNode => {
    return (
      <atomic-icon
        part="icon"
        icon={MagnifyingGlass}
        class="my-6 flex flex-col items-center w-1/2 max-w-lg"
      ></atomic-icon>
    );
  };

  const getSummary = () => {
    return props.querySummaryState.hasQuery
      ? props.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: props.querySummaryState.query,
        })
      : props.bindings.i18n.t('no-results');
  };

  const renderNoResults = (): VNode => {
    const {hasQuery, query} = props.querySummaryState;
    const content = hasQuery
      ? props.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: wrapHighlight(query),
        })
      : props.bindings.i18n.t('no-results');
    return (
      // file deepcode ignore ReactSetInnerHtml: This is not React code.
      <div
        class="my-2 text-2xl font-medium truncate overflow-hidden max-w-full"
        part="no-results"
        innerHTML={content}
      ></div>
    );
  };

  const renderSearchTips = (): VNode => {
    return (
      <div class="my-2 text-lg text-neutral-dark" part="search-tips">
        {props.bindings.i18n.t('search-tips')}
      </div>
    );
  };

  const {firstSearchExecuted, isLoading, hasResults} = props.searchStatusState;
  if (!firstSearchExecuted || isLoading || hasResults) {
    return <span></span>;
  }

  props.setAriaLive(getSummary());

  return [
    <div class="flex flex-col items-center h-full w-full text-on-background">
      {renderMagnifyingGlass()}
      {renderNoResults()}
      {renderSearchTips()}
      {...children}
    </div>,
    <slot></slot>,
  ] as VNode[];
};
