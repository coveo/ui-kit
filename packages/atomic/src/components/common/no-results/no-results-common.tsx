import {h, VNode, FunctionalComponent} from '@stencil/core';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';
import {LocalizedString} from '../../../utils/jsx-utils';
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

const BetweenQuotes: FunctionalComponent<{
  content: string;
  bindings: AnyBindings;
}> = (props) => {
  return (
    <span
      class="font-bold truncate inline-block align-bottom max-w-full whitespace-normal"
      part="highlight"
    >
      <LocalizedString
        key="between-quotations"
        params={{text: props.content}}
        bindings={props.bindings}
      />
    </span>
  );
};

const MagnifyingGlass: FunctionalComponent = () => (
  <atomic-icon
    part="icon"
    icon={MagnifyingGlassIcon}
    class="my-6 flex flex-col items-center w-1/2 max-w-lg"
  ></atomic-icon>
);

const NoResults: FunctionalComponent<{
  querySummaryState: NoResultsProps['querySummaryState'];
  bindings: AnyBindings;
}> = (props) => {
  const {hasQuery, query} = props.querySummaryState;
  const content = hasQuery ? (
    <LocalizedString
      bindings={props.bindings}
      key="no-results-for"
      params={{
        query: <BetweenQuotes bindings={props.bindings} content={query} />,
      }}
    />
  ) : (
    props.bindings.i18n.t('no-results')
  );
  return (
    <div
      class="my-2 text-2xl font-medium max-w-full text-center"
      part="no-results"
    >
      {content}
    </div>
  );
};

const SearchTips: FunctionalComponent<{bindings: AnyBindings}> = (props) => {
  return (
    <div class="my-2 text-lg text-neutral-dark text-center" part="search-tips">
      {props.bindings.i18n.t('search-tips')}
    </div>
  );
};

export const NoResultsCommon: FunctionalComponent<NoResultsProps> = (
  props,
  children
) => {
  const getSummary = () => {
    if (props.searchStatusState.hasResults) {
      return '';
    }
    return props.querySummaryState.hasQuery
      ? props.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: props.querySummaryState.query,
        })
      : props.bindings.i18n.t('no-results');
  };

  props.setAriaLive(getSummary());

  const {firstSearchExecuted, isLoading, hasResults} = props.searchStatusState;
  if (!firstSearchExecuted || isLoading || hasResults) {
    return <span></span>;
  }

  return [
    <div class="flex flex-col items-center h-full w-full text-on-background">
      <MagnifyingGlass />
      <NoResults {...props} />
      <SearchTips {...props} />
      {...children}
    </div>,
    <slot></slot>,
  ] as VNode[];
};
