import {afterNextRender, DestroyRef, Directive, inject, signal} from '@angular/core';
import {buildQuerySummary, buildSearchEngine, type SearchEngine} from '@coveo/headless';
import type {Observable} from 'rxjs';

export interface SearchInterfaceMethods {
  initializeWithSearchEngine(engine: SearchEngine): Promise<void>;
  executeFirstSearch(): Promise<void>;
}

/**
 * State and behavior shared by the wrapper page and the custom elements page, so that both pages
 * render the same template and differ only in how they reach the Atomic elements.
 */
@Directive()
export abstract class SearchPage {
  protected readonly language = signal('en');
  protected readonly mobileBreakpoint = signal('1024px');
  protected readonly facetLabel = signal('Authors');
  protected readonly totalResults = signal<number | null>(null);
  protected readonly breakpointFromObservable = signal('');
  // A plain field rather than a signal: without zone.js, it renders only because Angular marks
  // the view dirty when a template event listener runs.
  protected breakpointFromListener = '';

  private readonly destroyRef = inject(DestroyRef);

  protected abstract getSearchInterface(): Promise<SearchInterfaceMethods>;
  protected abstract breakpointChanges(): Observable<Event>;

  constructor() {
    afterNextRender(() => this.initialize());
  }

  protected toggleLanguage() {
    this.language.update((language) => (language === 'en' ? 'fr' : 'en'));
  }

  protected toggleMobileBreakpoint() {
    this.mobileBreakpoint.update((breakpoint) => (breakpoint === '1024px' ? '800px' : '1024px'));
  }

  protected toggleFacetLabel() {
    this.facetLabel.update((label) => (label === 'Authors' ? 'Writers' : 'Authors'));
  }

  protected onBreakpointChange(event: Event) {
    this.breakpointFromListener = breakpointOf(event);
  }

  private async initialize() {
    const subscription = this.breakpointChanges().subscribe((event) =>
      this.breakpointFromObservable.set(breakpointOf(event))
    );
    this.destroyRef.onDestroy(() => subscription.unsubscribe());

    const engine = buildSearchEngine({
      configuration: {
        // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
        analytics: {analyticsMode: 'legacy'},
      },
    });
    const querySummary = buildQuerySummary(engine);
    this.destroyRef.onDestroy(
      querySummary.subscribe(() => {
        const {firstSearchExecuted, total} = querySummary.state;
        this.totalResults.set(firstSearchExecuted ? total : null);
      })
    );

    const searchInterface = await this.getSearchInterface();
    await searchInterface.initializeWithSearchEngine(engine);
    await searchInterface.executeFirstSearch();
  }
}

const breakpointOf = (event: Event) =>
  (event as CustomEvent<{breakpoint: string}>).detail.breakpoint;
