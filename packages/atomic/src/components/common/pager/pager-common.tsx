import {EventEmitter, h} from '@stencil/core';
import ArrowRight from '../../../images/arrow-right.svg';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {randomID} from '../../../utils/utils';
import {Button} from '../button';
import {AnyBindings} from '../interface/bindings';
import {RadioButton} from '../radio-button';
import {Pager, SearchStatus} from '../types';

interface SearchStatusOptions {
  bindings: AnyBindings;
  initializeSearchStatus(): SearchStatus;
  initializePager(): Pager;
  getEventEmitter(): EventEmitter | undefined;
  getActivePage(): FocusTargetController | undefined;
}

export class PagerCommon {
  private bindings: AnyBindings;
  private searchStatus: SearchStatus;
  private pager: Pager;
  private getEventEmitter: () => EventEmitter | undefined;
  private getActivePage: () => FocusTargetController | undefined;
  private readonly radioGroupName = randomID('atomic-insight-pager-');

  constructor(props: SearchStatusOptions) {
    this.bindings = props.bindings;
    this.searchStatus = props.initializeSearchStatus();
    this.pager = props.initializePager();
    this.getEventEmitter = props.getEventEmitter;
    this.getActivePage = props.getActivePage;
  }

  public selectPage(page: number) {
    this.pager.selectPage(page);
    this.getActivePage()
      ?.focusAfterSearch()
      .then(() => this.scrollToTop());
  }

  private scrollToTop() {
    this.getEventEmitter()?.emit();
  }

  private get previousButton() {
    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('previous')}
        onClick={() => {
          this.pager.previousPage();
          this.scrollToTop();
        }}
        part="previous-button"
        disabled={!this.pager.state.hasPreviousPage}
        class="p-1 min-w-[2.5rem] min-h-[2.5rem]"
      >
        <atomic-icon
          icon={ArrowRight}
          class="w-5 align-middle rotate-180"
        ></atomic-icon>
      </Button>
    );
  }

  private get pages() {
    const pages = this.pager.state.currentPages;
    return (
      <div part="page-buttons" role="radiogroup" class="contents">
        {pages.map((page) => this.buildPage(page))}
      </div>
    );
  }

  private buildPage(page: number) {
    const isSelected = this.pager.isCurrentPage(page);
    const parts = ['page-button'];
    if (isSelected) {
      parts.push('active-page-button');
    }
    return (
      <RadioButton
        key={page}
        groupName={this.radioGroupName}
        style="outline-neutral"
        checked={isSelected}
        ariaCurrent={isSelected ? 'page' : 'false'}
        ariaLabel={this.bindings.i18n.t('page-number', {page})}
        onChecked={() => this.selectPage(page)}
        class="btn-page focus-visible:bg-neutral-light p-1 min-w-[2.5rem] min-h-[2.5rem]"
        part={parts.join(' ')}
        text={page.toLocaleString(this.bindings.i18n.language)}
        ref={isSelected ? this.getActivePage()?.setTarget : undefined}
      ></RadioButton>
    );
  }

  private get nextButton() {
    return (
      <Button
        style="outline-primary"
        ariaLabel={this.bindings.i18n.t('next')}
        onClick={() => {
          this.pager.nextPage();
          this.scrollToTop();
        }}
        part="next-button"
        disabled={!this.pager.state.hasNextPage}
        class="p-1 min-w-[2.5rem] min-h-[2.5rem]"
      >
        <atomic-icon icon={ArrowRight} class="w-5 align-middle"></atomic-icon>
      </Button>
    );
  }

  public render() {
    if (
      !this.bindings.store.isAppLoaded() ||
      !this.searchStatus.state.hasResults
    ) {
      return;
    }

    return (
      <nav aria-label={this.bindings.i18n.t('pagination')}>
        <div part="buttons" class="flex gap-2 flex-wrap">
          {this.previousButton}
          {this.pages}
          {this.nextButton}
        </div>
      </nav>
    );
  }
}
