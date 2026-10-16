import type {Facet, FacetSearchState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {announceFacetSearchResultsWithAriaLive} from './facet-search-aria-live';

type FacetSearch = Pick<Facet, 'subscribe'> & {
  state: {facetSearch: FacetSearchState};
};

function createFacet(initial: Partial<FacetSearchState>) {
  let listener: () => void = () => {};
  const facet = {
    state: {facetSearch: initial as FacetSearchState},
    subscribe(cb: () => void) {
      listener = cb;
      return () => {
        listener = () => {};
      };
    },
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
    const controllers: ReactiveController[] = [];
    const host = {
      addController(controller: ReactiveController) {
        controllers.push(controller);
        controller.hostConnected?.();
      },
    } as unknown as ReactiveControllerHost;
    announceFacetSearchResultsWithAriaLive(
      host,
      facet as unknown as FacetSearch,
      'My Facet',
      setAriaLive,
      i18n
    );
    return {facet, setAriaLive, controllers};
  };

  it('announces the count when a search finishes with results', () => {
    const {facet, setAriaLive} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'co', values: [], isLoading: true});
    facet.emit({query: 'co', values: [{}, {}] as never, isLoading: false});
    expect(setAriaLive).toHaveBeenCalledExactlyOnceWith('2 in My Facet');
  });

  it('announces zero when a search finishes with no matches', () => {
    const {facet, setAriaLive} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'zzz', values: [], isLoading: true});
    facet.emit({query: 'zzz', values: [], isLoading: false});
    expect(setAriaLive).toHaveBeenCalledExactlyOnceWith('0 in My Facet');
  });

  it('does not announce while still loading', () => {
    const {facet, setAriaLive} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    facet.emit({query: 'co', values: [], isLoading: true});
    expect(setAriaLive).not.toHaveBeenCalled();
  });

  it('does not announce when the query is empty', () => {
    const {facet, setAriaLive} = setup({
      query: 'co',
      values: [],
      isLoading: true,
    });
    facet.emit({query: '', values: [], isLoading: false});
    expect(setAriaLive).not.toHaveBeenCalled();
  });

  it('stops announcing once the host is disconnected and resumes when it reconnects', () => {
    const {facet, setAriaLive, controllers} = setup({
      query: '',
      values: [],
      isLoading: false,
    });
    controllers[0].hostDisconnected?.();
    facet.emit({query: 'co', values: [], isLoading: true});
    facet.emit({query: 'co', values: [{}, {}] as never, isLoading: false});
    expect(setAriaLive).not.toHaveBeenCalled();

    controllers[0].hostConnected?.();
    facet.emit({query: 'cov', values: [], isLoading: true});
    facet.emit({query: 'cov', values: [{}] as never, isLoading: false});
    expect(setAriaLive).toHaveBeenCalledExactlyOnceWith('1 in My Facet');
  });
});
