import {Schema, StringValue} from '@coveo/bueno';
import {
  AnyFacetValuesCondition,
  AnyFacetValueRequest,
  FacetValueState,
  FacetManager,
} from '@coveo/headless';
import {i18n} from 'i18next';
import {FacetInfoMap} from '../../search/atomic-search-interface/store';
import {initializePopover} from '../../search/facets/atomic-popover/popover-type';
import {AnyBindings} from '../interface/bindings';
import {
  CategoryFacet,
  CategoryFacetSortCriterion,
  CategoryFacetState,
  CategoryFacetValueRequest,
  DateFacet,
  DateFacetState,
  Facet,
  FacetConditionsManager,
  FacetSearchState,
  FacetSortCriterion,
  FacetState,
  FacetValue,
  FacetValueRequest,
  NumericFacet,
  NumericFacetState,
  RangeFacetSortCriterion,
  SearchStatus,
  SearchStatusState,
} from '../types';
import {FacetInfo} from './facet-common-store';
import {shouldUpdateFacetSearchComponent} from './facet-search/facet-search-utils';

export type FacetDisplayValues = 'checkbox' | 'link' | 'box';

export type PropsOnAllFacets = {
  facetId?: string;
  label?: string;
  field: string;
  filterFacetCount: boolean;
  injectionDepth: number;
  dependsOn: Record<string, string>;
};

type AnyFacetType = Facet | NumericFacet | CategoryFacet | DateFacet;

export type BaseFacet<FacetType extends AnyFacetType> = {
  facet?: FacetType;
  searchStatus: SearchStatus;
  searchStatusState: SearchStatusState;
  error: Error;
} & PropsOnAllFacets &
  StateProp<FacetType> &
  SearchProp<FacetType> &
  NumberOfValuesProp<FacetType> &
  NumberOfIntervalsProp<FacetType> &
  SortCriterionProp<FacetType> &
  DisplayValuesAsProp &
  CollapsedProp &
  HeadingLevelProp;

export type BaseFacetElement<FacetType extends AnyFacetType = AnyFacetType> =
  HTMLElement &
    Required<PropsOnAllFacets> &
    SearchProp<FacetType> &
    NumberOfValuesProp<FacetType> &
    NumberOfIntervalsProp<FacetType> &
    SortCriterionProp<FacetType> &
    DisplayValuesAsProp &
    CollapsedProp &
    HeadingLevelProp;

type StateProp<FacetType extends AnyFacetType> = FacetType extends Facet
  ? {facetState: FacetState}
  : FacetType extends NumericFacet
    ? {facetState: NumericFacetState}
    : FacetType extends CategoryFacet
      ? {facetState: CategoryFacetState}
      : FacetType extends DateFacet
        ? {facetState: DateFacetState}
        : {facetState: never};

type SearchProp<FacetType extends AnyFacetType> = FacetType extends
  | Facet
  | CategoryFacet
  ? {withSearch: boolean}
  : {};

type NumberOfValuesProp<FacetType extends AnyFacetType> = FacetType extends
  | Facet
  | CategoryFacet
  ? {numberOfValues: number}
  : {};

type NumberOfIntervalsProp<FacetType extends AnyFacetType> =
  FacetType extends NumericFacet ? {numberOfIntervals?: number} : {};

type SortCriterionProp<FacetType extends AnyFacetType> = FacetType extends
  | Facet
  | CategoryFacet
  ? {
      sortCriteria: FacetType extends Facet
        ? FacetSortCriterion
        : CategoryFacetSortCriterion;
    }
  : FacetType extends NumericFacet
    ? {sortCriteria?: RangeFacetSortCriterion}
    : {};

type DisplayValuesAsProp = {
  displayValueAs?: 'checkbox' | 'box' | 'link';
};

type CollapsedProp = {isCollapsed?: boolean};

type HeadingLevelProp = {headingLevel?: number};

export interface FacetValueProps {
  i18n: i18n;
  displayValue: string;
  numberOfResults: number;
  isSelected: boolean;
  onClick(): void;
  searchQuery?: string;
  class?: string;
  part?: string;
  additionalPart?: string;
  buttonRef?: (element?: HTMLButtonElement) => void;
}

export type TriStateFacetValueProps = Omit<FacetValueProps, 'isSelected'> & {
  state: FacetValueState;
  onExclude(): void;
};

function isCategoryFacetValueRequest(
  value: AnyFacetValueRequest
): value is CategoryFacetValueRequest {
  return 'children' in value && Array.isArray(value.children);
}

function isFacetValueRequest(
  value: AnyFacetValueRequest
): value is FacetValueRequest {
  return (
    'value' in value &&
    typeof value.value === 'string' &&
    !('children' in value)
  );
}

function getSelectedCategoryFacetValueRequest(
  value: CategoryFacetValueRequest
): CategoryFacetValueRequest | null {
  if (value.state === 'selected') {
    return value;
  }
  for (const child of value.children) {
    const selectedValue = getSelectedCategoryFacetValueRequest(child);
    if (selectedValue !== null) {
      return selectedValue;
    }
  }
  return null;
}

export function parseDependsOn(
  dependsOn: Record<string, string>
): AnyFacetValuesCondition<AnyFacetValueRequest>[] {
  return Object.entries(dependsOn).map(([parentFacetId, expectedValue]) => {
    return {
      parentFacetId,
      condition: (values) => {
        return values.some((value) => {
          if (isCategoryFacetValueRequest(value)) {
            const selectedValue = getSelectedCategoryFacetValueRequest(value);
            if (!selectedValue) {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return selectedValue.value === expectedValue;
          }
          if (isFacetValueRequest(value)) {
            if (value.state !== 'selected') {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return value.value === expectedValue;
          }
          return false;
        });
      },
    };
  });
}

export function validateDependsOn(dependsOn: Record<string, string>) {
  if (Object.keys(dependsOn).length > 1) {
    throw "Depending on multiple facets isn't supported";
  }
}

export function shouldDisplayInputForFacetRange(facetRange: {
  hasInput: boolean;
  hasInputRange: boolean;
  searchStatusState: SearchStatusState;
  facetValues: Pick<FacetValue, 'numberOfResults' | 'state'>[];
}) {
  const {hasInput, hasInputRange, searchStatusState, facetValues} = facetRange;
  if (!hasInput) {
    return false;
  }

  if (hasInputRange) {
    return true;
  }

  if (!searchStatusState.hasResults) {
    return false;
  }

  const onlyValuesWithResultsOrActive =
    facetValues.filter(
      (value) => value.numberOfResults || value.state !== 'idle'
    ) || [];

  if (!onlyValuesWithResultsOrActive.length) {
    return false;
  }

  return true;
}

export function sortFacetVisibility(
  facetElements: BaseFacetElement[],
  facetInfoMap: FacetInfoMap
) {
  const visibleFacets: BaseFacetElement[] = [];
  const invisibleFacets: BaseFacetElement[] = [];

  facetElements.forEach((facet) => {
    if (facetInfoMap[facet.facetId] && facetInfoMap[facet.facetId].isHidden()) {
      invisibleFacets.push(facet);
    } else {
      visibleFacets.push(facet);
    }
  });

  return {visibleFacets, invisibleFacets};
}

export function collapseFacetsAfter(
  facets: BaseFacetElement[],
  visibleFacetsCount: number
) {
  if (visibleFacetsCount === -1) {
    return;
  }

  facets.forEach((facet, index) => {
    facet.isCollapsed = index + 1 > visibleFacetsCount;
  });
}

export function isAutomaticFacetGenerator(
  element: HTMLElement
): element is HTMLAtomicAutomaticFacetGeneratorElement {
  return element.tagName === 'ATOMIC-AUTOMATIC-FACET-GENERATOR';
}

function isPseudoFacet(el: Element): el is BaseFacetElement {
  return 'facetId' in el;
}

export function getFacetsInChildren(parent: HTMLElement): BaseFacetElement[] {
  const facets = Array.from(parent.children).filter((child) =>
    isPseudoFacet(child)
  ) as BaseFacetElement[];

  return facets;
}
export function getAutomaticFacetGenerator(
  parent: HTMLElement
): HTMLAtomicAutomaticFacetGeneratorElement | undefined {
  return (Array.from(parent.children) as HTMLElement[]).find(
    isAutomaticFacetGenerator
  );
}

const get2DMatrix = (xSize: number, ySize: number = 0) =>
  new Array(xSize).fill(null).map(() => new Array(ySize));

function findIndiceOfParent(
  facet: BaseFacetElement,
  parents: (HTMLElement | null)[]
) {
  for (let i = 0; i < parents.length; i++) {
    if (parents[i]?.contains(facet)) {
      return i;
    }
  }
  return parents.length;
}

/**
 * Triage elements by their parents.
 * @param facets Facet Elements
 * @param parents Elements that may contains the facets
 * @returns an array in the same order as the parents, containing the facets that are contained by the corresponding parent.
 * The last element of the array contains the facets that are not contained by any of the parents.
 */
export function triageFacetsByParents(
  facets: BaseFacetElement[],
  ...parents: (HTMLElement | null)[]
) {
  const sortedFacets: BaseFacetElement[][] = get2DMatrix(parents.length + 1);
  for (const facet of facets) {
    const indice = findIndiceOfParent(facet, parents);
    sortedFacets[indice].push(facet);
  }
  return sortedFacets;
}

export function sortFacetsUsingManager(
  facets: BaseFacetElement[],
  facetManager: FacetManager
): BaseFacetElement[] {
  const payload = facets.map((f) => ({
    facetId: f.facetId,
    payload: f,
  }));
  return facetManager.sort(payload).map((f) => f.payload);
}

interface FacetCommonOptions {
  host: HTMLElement;
  bindings: AnyBindings;
  label: string;
  field: string;
  headingLevel: number;
  displayValuesAs: FacetDisplayValues;
  dependsOn: Record<string, string>;
  dependenciesManager: FacetConditionsManager;
  facet: Facet;
  facetId: string;
  sortCriteria: FacetSortCriterion;
  withSearch: boolean;
  enableExclusion: boolean;
}

export class FacetCommon {
  private host: HTMLElement;
  private bindings: AnyBindings;
  public label: string;
  private displayValuesAs: FacetDisplayValues;
  private dependsOn: Record<string, string>;
  public dependenciesManager: FacetConditionsManager;
  private facet: Facet;
  private facetId: string;
  private withSearch: boolean;

  constructor(opts: FacetCommonOptions) {
    this.host = opts.host;
    this.bindings = opts.bindings;
    this.label = opts.label;
    this.displayValuesAs = opts.displayValuesAs;
    this.dependsOn = opts.dependsOn;
    this.dependenciesManager = opts.dependenciesManager;
    this.facet = opts.facet;
    this.facetId = opts.facetId;
    this.withSearch = opts.withSearch;

    this.validateProps();

    const facetInfo: FacetInfo = {
      label: () => this.bindings.i18n.t(this.label),
      facetId: this.facetId!,
      element: this.host,
      isHidden: () => this.isHidden,
    };
    this.bindings.store.registerFacet('facets', facetInfo);
    initializePopover(this.host, {
      ...facetInfo,
      hasValues: () => !!this.facet.state.values.length,
      numberOfActiveValues: () => this.numberOfActiveValues,
    });
  }

  public validateProps() {
    new Schema({
      displayValuesAs: new StringValue({
        constrainTo: ['checkbox', 'link', 'box'],
      }),
    }).validate({
      displayValuesAs: this.displayValuesAs,
    });
    validateDependsOn(this.dependsOn);
  }

  public disconnectedCallback() {
    if (this.host.isConnected) {
      return;
    }
    this.dependenciesManager?.stopWatching();
  }

  private get isHidden() {
    return !this.facet.state.enabled || !this.facet.state.values.length;
  }

  public componentShouldUpdate(
    next: FacetSearchState,
    prev: FacetSearchState,
    propName: string
  ) {
    if (propName === 'facetState' && prev && this.withSearch) {
      return shouldUpdateFacetSearchComponent(next, prev);
    }

    return true;
  }

  private get numberOfActiveValues() {
    return this.facet.state.values.filter(({state}) => state !== 'idle').length;
  }
}
