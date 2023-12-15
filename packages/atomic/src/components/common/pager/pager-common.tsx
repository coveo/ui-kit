import {EventEmitter, FunctionalComponent, h} from '@stencil/core';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import ArrowRightIcon from '../../../images/arrow-right-rounded.svg';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {randomID} from '../../../utils/utils';
import {Button} from '../button';
import {Hidden} from '../hidden';
import {AnyBindings} from '../interface/bindings';
import {RadioButton} from '../radio-button';

interface PagerProps {
  bindings: AnyBindings;
  searchStatusState: {
    hasResults: boolean;
    hasError: boolean;
  };
  pagerState: {
    hasPreviousPage: boolean;
    currentPages: number[];
    hasNextPage: boolean;
  };
  eventEmitter: EventEmitter;
  activePage: FocusTargetController | undefined;
  pager: {
    selectPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    isCurrentPage: (page: number) => boolean;
    state: {};
  };
  previousButtonIcon?: string;
  nextButtonIcon?: string;
}

export const PagerCommon: FunctionalComponent<PagerProps> = (props) => {
  const radioGroupName = randomID('atomic-insight-pager-');

  const focusOnFirstResultAndScrollToTop = async () => {
    await props.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
    props.eventEmitter?.emit();
  };

  const selectPage = async (page: number) => {
    props.pager.selectPage(page);
    focusOnFirstResultAndScrollToTop();
  };

  const nextButtonIcon = props.nextButtonIcon || ArrowRightIcon;
  const previousButtonIcon = props.previousButtonIcon || ArrowLeftIcon;
  const defaultIconStyle = 'w-5 align-middle';

  const renderPreviousButton = () => {
    return (
      <Button
        style="outline-primary"
        ariaLabel={props.bindings.i18n.t('previous')}
        onClick={() => {
          props.pager.previousPage();
          focusOnFirstResultAndScrollToTop();
        }}
        part="previous-button"
        disabled={!props.pagerState.hasPreviousPage}
        class="p-1 min-w-[2.5rem] min-h-[2.5rem] flex justify-center items-center"
      >
        <atomic-icon
          icon={previousButtonIcon}
          part="previous-button-icon"
          class={defaultIconStyle}
        ></atomic-icon>
      </Button>
    );
  };

  const renderPages = () => {
    const pages = props.pagerState.currentPages;
    return (
      <div part="page-buttons" role="radiogroup" class="contents">
        {pages.map(renderPage)}
      </div>
    );
  };

  const renderPage = (page: number) => {
    const isSelected = props.pager.isCurrentPage(page);
    const parts = ['page-button'];
    if (isSelected) {
      parts.push('active-page-button');
    }
    return (
      <RadioButton
        key={page}
        groupName={radioGroupName}
        style="outline-neutral"
        checked={isSelected}
        ariaCurrent={isSelected ? 'page' : 'false'}
        ariaLabel={props.bindings.i18n.t('page-number', {page})}
        onChecked={() => selectPage(page)}
        class="btn-page focus-visible:bg-neutral-light p-1 min-w-[2.5rem] min-h-[2.5rem]"
        part={parts.join(' ')}
        text={page.toLocaleString(props.bindings.i18n.language)}
        ref={isSelected ? (el) => props.activePage?.setTarget(el) : undefined}
      ></RadioButton>
    );
  };

  const renderNextButton = () => {
    return (
      <Button
        style="outline-primary"
        ariaLabel={props.bindings.i18n.t('next')}
        onClick={() => {
          props.pager.nextPage();
          focusOnFirstResultAndScrollToTop();
        }}
        part="next-button"
        disabled={!props.pagerState.hasNextPage}
        class="p-1 min-w-[2.5rem] min-h-[2.5rem] flex justify-center items-center"
      >
        <atomic-icon
          icon={nextButtonIcon}
          part="next-button-icon"
          class={defaultIconStyle}
        ></atomic-icon>
      </Button>
    );
  };

  if (props.searchStatusState.hasError) {
    return <Hidden />;
  }

  if (
    !props.bindings.store.isAppLoaded() ||
    !props.searchStatusState.hasResults
  ) {
    return;
  }

  return (
    <nav aria-label={props.bindings.i18n.t('pagination')}>
      <div part="buttons" class="flex gap-2 flex-wrap">
        {renderPreviousButton()}
        {renderPages()}
        {renderNextButton()}
      </div>
    </nav>
  );
};
