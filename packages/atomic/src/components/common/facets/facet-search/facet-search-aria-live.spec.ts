import type {Facet, FacetSearchState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {announceFacetSearchResultsWithAriaLive} from './facet-search-aria-live';

type FacetSearch = Pick<Facet, 'subscribe'> & {
  state: {facetSearch: FacetSearchState};
};

class MockHost {
  isConnected = true;
  private controllers: ReactiveController[] = [];

  addController(controller: ReactiveController) {
    this.controllers.push(controller);
    controller.hostConnected?.();
  }

  remove() {
    this.isConnected = false;
    this.controllers.forEach((controller) => controller.hostDisconnected?.());
  }

  addBack() {
    this.isConnected = true;
    this.controllers.forEach((controller) => controller.hostConnected?.());
  }

  move() {
    this.controllers.forEach((controller) => controller.hostDisconnected?.());
    this.controllers.forEach((controller) => controller.hostConnected?.());
  }
}

function createFacet(initial: Partial<FacetSearchState>) {
  let listener: () => void = () => {};
  const facet = {
    state: {facetSearch: initial as FacetSearchState},
    subscribe: vi.fn((cb: () => void) => {
      listener = cb;
      cb();
      return () => {
        listener = () => {};
      };
    }),
    emit(next: Partial<FacetSearchState>) {
      facet.state.facetSearch = next as FacetSearchState;
      listener();
    },
  };
  return facet;
}

const i18n = {
  t: (_key: string, opts: {count: number; label: string}) => `${opts.count} in ${opts.label}`,
} as unknown as i18n;

describe('#announceFacetSearchResultsWithAriaLive', () => {
  const setup = (initial: Partial<FacetSearchState>) => {
    const facet = createFacet(initial);
    const setAriaLive = vi.fn();
    const host = new MockHost();
    announceFacetSearchResultsWithAriaLive(
      host as unknown as ReactiveControllerHost & Element,
      facet as unknown as FacetSearch,
      'My Facet',
      setAriaLive,
      i18n
    );
    return {facet, setAriaLive, host};
  };

  it('should announce the count when a search finishes with results', () => {
    const {facet, setAriaLive} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'co', values: [], isLoading: true});
    facet.emit({query: 'co', values: [{}, {}] as never, isLoading: false});
    expect(setAriaLive).toHaveBeenCalledExactlyOnceWith('2 in My Facet');
  });

  it('should announce zero when a search finishes with no matches', () => {
    const {facet, setAriaLive} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'zzz', values: [], isLoading: true});
    facet.emit({query: 'zzz', values: [], isLoading: false});
    expect(setAriaLive).toHaveBeenCalledExactlyOnceWith('0 in My Facet');
  });

  it('should not announce while still loading', () => {
    const {facet, setAriaLive} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'co', values: [], isLoading: true});
    expect(setAriaLive).not.toHaveBeenCalled();
  });

  it('should not announce when the query is empty', () => {
    const {facet, setAriaLive} = setup({
      query: 'co',
      values: [],
      isLoading: true,
    });
    facet.emit({query: '', values: [], isLoading: false});
    expect(setAriaLive).not.toHaveBeenCalled();
  });

  it('should stop announcing once the host is removed from the DOM', () => {
    const {facet, setAriaLive, host} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    host.remove();
    facet.emit({query: 'co', values: [], isLoading: true});
    facet.emit({query: 'co', values: [{}, {}] as never, isLoading: false});
    expect(setAriaLive).not.toHaveBeenCalled();
  });

  it('should announce again once the host is added back to the DOM', () => {
    const {facet, setAriaLive, host} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    host.remove();
    host.addBack();
    facet.emit({query: 'cov', values: [], isLoading: true});
    facet.emit({query: 'cov', values: [{}] as never, isLoading: false});
    expect(setAriaLive).toHaveBeenCalledExactlyOnceWith('1 in My Facet');
  });

  it('should not repeat the last announcement when the host is added back to the DOM', () => {
    const {facet, setAriaLive, host} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'co', values: [], isLoading: true});
    facet.emit({query: 'co', values: [{}, {}] as never, isLoading: false});
    host.remove();
    host.addBack();
    expect(setAriaLive).toHaveBeenCalledOnce();
  });

  it('should keep its subscription when the host is moved within the DOM', () => {
    const {facet, host} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    host.move();
    expect(facet.subscribe).toHaveBeenCalledOnce();
  });
});
