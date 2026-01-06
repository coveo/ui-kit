/*  src/app/coveo-headless-rga.component.ts */

import {CommonModule} from '@angular/common';
import {
  Component,
  inject,
  type OnDestroy,
  type OnInit,
  signal,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  type GeneratedAnswerState,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  type SearchBoxState,
} from '@coveo/headless';
import type {CoveoHeadlessRGAService as CoveoHeadlessRGAServiceType} from './coveo-headless-rga.service';
import {CoveoHeadlessRGAService} from './coveo-headless-rga.service';

@Component({
  selector: 'app-coveo-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coveo-headless-rga.component.html',
})
export class CoveoSearchComponent implements OnInit, OnDestroy {
  private searchBox!: ReturnType<CoveoHeadlessRGAServiceType['buildSearchBox']>;
  private generatedAnswer!: ReturnType<
    CoveoHeadlessRGAServiceType['buildGeneratedAnswer']
  >;

  searchBoxState = signal<SearchBoxState>({
    isLoading: false,
    isLoadingSuggestions: false,
    searchBoxId: '',
    suggestions: [],
    value: '',
  });
  generatedAnswerState = signal<GeneratedAnswerState | undefined>(undefined);

  private unsubscribers: Array<() => void> = [];
  private headless = inject(CoveoHeadlessRGAService);

  ngOnInit(): void {
    this.headless.initEngine();
    this.searchBox = this.headless.buildSearchBox();
    this.generatedAnswer = this.headless.buildGeneratedAnswer();

    const {logInterfaceLoad} = loadSearchAnalyticsActions(this.headless.engine);
    const {executeSearch} = loadSearchActions(this.headless.engine);
    this.headless.engine.dispatch(executeSearch(logInterfaceLoad()));

    this.unsubscribers.push(
      this.searchBox.subscribe(() =>
        this.searchBoxState.set(this.searchBox.state)
      ),
      this.generatedAnswer.subscribe(() => {
        return this.generatedAnswerState.set(this.generatedAnswer.state);
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribers.forEach((u) => u());
  }

  onSearchSubmit(): void {
    const {updateQuery} = loadQueryActions(this.headless.engine);
    const {logSearchboxSubmit} = loadSearchAnalyticsActions(
      this.headless.engine
    );
    const {executeSearch} = loadSearchActions(this.headless.engine);
    this.headless.engine.dispatch(
      updateQuery({q: this.searchBoxState()?.value})
    );
    this.headless.engine.dispatch(executeSearch(logSearchboxSubmit()));
  }

  onClear(): void {
    const {updateQuery} = loadQueryActions(this.headless.engine);
    const {logSearchboxSubmit} = loadSearchAnalyticsActions(
      this.headless.engine
    );
    const {executeSearch} = loadSearchActions(this.headless.engine);

    this.headless.engine.dispatch(updateQuery({q: ''}));
    this.headless.engine.dispatch(executeSearch(logSearchboxSubmit()));
  }
}
