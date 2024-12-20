import {createStore} from '@stencil/store';
import {isInDocument} from '../../../utils/utils';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../facets/facet-common-store';
import {DateFacetValue, NumericFacetValue} from '../types';
import {AnyEngineType} from './bindings';

interface CommonStencilStore<StoreData extends AtomicCommonStoreData> {
  state: StoreData;
  onChange: <PropName extends keyof StoreData>(
    propName: PropName,
    cb: (newValue: StoreData[PropName]) => void
  ) => () => void;
}

export interface ResultListInfo {
  focusOnNextNewResult(): void;
  focusOnFirstResultAfterNextSearch(): Promise<void>;
}

export type AtomicCommonStoreData = {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  loadingFlags: string[];
  iconAssetsPath: string;
  fieldsToInclude: string[];
  facetElements: HTMLElement[];
  resultList?: ResultListInfo;
};

export interface AtomicCommonStore<StoreData extends AtomicCommonStoreData>
  extends CommonStencilStore<StoreData> {
  getIconAssetsPath(): string;
  setLoadingFlag(flag: string): void;
  unsetLoadingFlag(loadingFlag: string): void;
  hasLoadingFlag(loadingFlag: string): boolean;
  waitUntilAppLoaded(callback: () => void): void;
  isAppLoaded(): boolean;
  getUniqueIDFromEngine(engine: AnyEngineType): string;
  getFacetElements(): HTMLElement[];
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: StoreData[T][U] & {facetId: U; element: HTMLElement}
  ): void;
  registerResultList(data: ResultListInfo): void;
  addFieldsToInclude(fields: string[]): void;
}

export const isRefineModalFacet = 'is-refine-modal';

export function createAtomicCommonStore<
  StoreData extends AtomicCommonStoreData,
>(initialStoreData: StoreData): AtomicCommonStore<StoreData> {
  const stencilStore = createStore(
    initialStoreData
  ) as CommonStencilStore<StoreData>;

  const clearExistingFacetElement = (facetType: FacetType, facetId: string) => {
    if (stencilStore.state[facetType][facetId]) {
      stencilStore.state.facetElements =
        stencilStore.state.facetElements.filter(
          (facetElement) => facetElement.getAttribute('facet-id') !== facetId
        );
    }
  };

  return {
    ...stencilStore,

    registerFacet<T extends FacetType, U extends string>(
      facetType: T,
      data: StoreData[T][U] & {facetId: U; element: HTMLElement}
    ) {
      if (data.element.getAttribute(isRefineModalFacet) !== null) {
        return;
      }

      clearExistingFacetElement(facetType, data.facetId);
      stencilStore.state.facetElements.push(data.element);
      stencilStore.state[facetType][data.facetId] = data;
    },

    getIconAssetsPath() {
      return stencilStore.state.iconAssetsPath;
    },

    setLoadingFlag(loadingFlag: string) {
      const flags = stencilStore.state.loadingFlags;
      stencilStore.state.loadingFlags = flags.concat(loadingFlag);
    },

    unsetLoadingFlag(loadingFlag: string) {
      const flags = stencilStore.state.loadingFlags;
      stencilStore.state.loadingFlags = flags.filter(
        (value) => value !== loadingFlag
      );
    },

    hasLoadingFlag(loadingFlag: string) {
      return stencilStore.state.loadingFlags.indexOf(loadingFlag) !== -1;
    },

    registerResultList(data: ResultListInfo) {
      stencilStore.state.resultList = data;
    },

    addFieldsToInclude(fields) {
      const currentFields = stencilStore.state.fieldsToInclude;
      stencilStore.state.fieldsToInclude = [...currentFields, ...fields];
    },

    waitUntilAppLoaded(callback: () => void) {
      if (!stencilStore.state.loadingFlags.length) {
        callback();
      } else {
        stencilStore.onChange('loadingFlags', (flags) => {
          if (!flags.length) {
            callback();
          }
        });
      }
    },

    isAppLoaded() {
      return !stencilStore.state.loadingFlags.length;
    },

    getUniqueIDFromEngine(_engine: AnyEngineType): string {
      throw new Error(
        'getUniqueIDFromEngine not implemented at the common store level.'
      );
    },

    getFacetElements() {
      return stencilStore.state.facetElements.filter((element) =>
        isInDocument(element)
      );
    },
  };
}
