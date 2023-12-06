import {Schema, StringValue} from '@coveo/bueno';
import {
  AnyFacetValuesCondition,
  AnyFacetValueRequest,
  FacetManager,
} from '@coveo/headless';
import {VNode, h} from '@stencil/core';
import {i18n} from 'i18next';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  getFieldCaptions,
  getFieldValueCaption,
} from '../../../utils/field-utils';
import {FacetInfoMap} from '../../search/atomic-search-interface/store';
import {initializePopover} from '../../search/facets/atomic-popover/popover-type';
import {Hidden} from '../hidden';
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
import {FacetContainer} from './facet-container/facet-container';
import {FacetHeader} from './facet-header/facet-header';
import {FacetPlaceholder} from './facet-placeholder/facet-placeholder';
import {FacetSearchInput} from './facet-search/facet-search-input';
import {FacetSearchMatches} from './facet-search/facet-search-matches';
import {
  shouldDisplaySearchResults,
  shouldUpdateFacetSearchComponent,
} from './facet-search/facet-search-utils';
import {FacetShowMoreLess} from './facet-show-more-less/facet-show-more-less';
import {FacetValueBox} from './facet-value-box/facet-value-box';
import {FacetValueCheckbox} from './facet-value-checkbox/facet-value-checkbox';
import {FacetValueLabelHighlight} from './facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from './facet-value-link/facet-value-link';
import {FacetValuesGroup} from './facet-values-group/facet-values-group';

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
}

interface FacetCommonRenderProps {
  hasError: boolean;
  firstSearchExecuted: boolean;
  isCollapsed: boolean;
  numberOfValues: number;
  headerFocus: FocusTargetController;
  showLessFocus: FocusTargetController;
  showMoreFocus: FocusTargetController;
  onToggleCollapse: () => boolean;
}

export class FacetCommon {
  private host: HTMLElement;
  private bindings: AnyBindings;
  private label: string;
  private field: string;
  private headingLevel: number;
  private displayValuesAs: FacetDisplayValues;
  private dependsOn: Record<string, string>;
  public dependenciesManager: FacetConditionsManager;
  private facet: Facet;
  private facetId: string;
  private sortCriteria: FacetSortCriterion;
  private withSearch: boolean;

  private resultIndexToFocusOnShowMore = 0;

  constructor(opts: FacetCommonOptions) {
    this.host = opts.host;
    this.bindings = opts.bindings;
    this.label = opts.label;
    this.field = opts.field;
    this.headingLevel = opts.headingLevel;
    this.displayValuesAs = opts.displayValuesAs;
    this.dependsOn = opts.dependsOn;
    this.dependenciesManager = opts.dependenciesManager;
    this.facet = opts.facet;
    this.facetId = opts.facetId;
    this.sortCriteria = opts.sortCriteria;
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
      numberOfSelectedValues: () => this.numberOfSelectedValues,
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

  public renderHeader(
    headerFocus: FocusTargetController,
    isCollapsed: boolean,
    onToggleCollapse: () => boolean
  ) {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={isCollapsed}
        headingLevel={this.headingLevel}
        onToggleCollapse={onToggleCollapse}
        headerRef={(el) => headerFocus.setTarget(el)}
      ></FacetHeader>
    );
  }

  private get numberOfSelectedValues() {
    return this.facet.state.values.filter(({state}) => state === 'selected')
      .length;
  }

  private renderSearchInput() {
    if (!this.withSearch) {
      return;
    }

    // Hide the input if there are no more values to load from the index and there are less than 8 values to display.
    // 8 is an arbitrary number, discussed with UX as a good compromise: A list long enough where it's worth searching.
    if (
      !this.facet.state.canShowMoreValues &&
      this.facet.state.values.length <= 8
    ) {
      return;
    }

    return (
      <FacetSearchInput
        i18n={this.bindings.i18n}
        label={this.label}
        query={this.facet.state.facetSearch.query}
        onChange={(value) => {
          if (value === '') {
            this.facet.facetSearch.clear();
            return;
          }
          this.facet.facetSearch.updateCaptions(
            getFieldCaptions(this.field, this.bindings.i18n)
          );
          this.facet.facetSearch.updateText(value);
          this.facet.facetSearch.search();
        }}
        onClear={() => this.facet.facetSearch.clear()}
      ></FacetSearchInput>
    );
  }

  private renderMatches() {
    return (
      <FacetSearchMatches
        i18n={this.bindings.i18n}
        query={this.facet.state.facetSearch.query}
        numberOfMatches={this.facet.state.facetSearch.values.length}
        hasMoreMatches={this.facet.state.facetSearch.moreValuesAvailable}
      ></FacetSearchMatches>
    );
  }

  private renderValuesContainer(children: VNode[], query?: string) {
    const classes = `mt-3 ${
      this.displayValuesAs === 'box' ? 'box-container' : ''
    }`;
    return (
      <FacetValuesGroup
        i18n={this.bindings.i18n}
        label={this.label}
        query={query}
      >
        <ul class={classes} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderSearchResults(
    showLessFocus: FocusTargetController,
    showMoreFocus: FocusTargetController
  ) {
    return this.renderValuesContainer(
      this.facet.state.facetSearch.values.map((value) =>
        this.renderValue(
          {
            state: 'idle',
            numberOfResults: value.count,
            value: value.rawValue,
          },
          () =>
            this.displayValuesAs === 'link'
              ? this.facet.facetSearch.singleSelect(value)
              : this.facet.facetSearch.select(value),
          false,
          false,
          showLessFocus,
          showMoreFocus
        )
      ),
      this.facet.state.facetSearch.query
    );
  }

  private renderValues(
    showLessFocus: FocusTargetController,
    showMoreFocus: FocusTargetController
  ) {
    return this.renderValuesContainer(
      this.facet.state.values.map((value, i) =>
        this.renderValue(
          value,
          () =>
            this.displayValuesAs === 'link'
              ? this.facet.toggleSingleSelect(value)
              : this.facet.toggleSelect(value),
          i === 0,
          i ===
            (this.sortCriteria === 'automatic'
              ? 0
              : this.resultIndexToFocusOnShowMore),
          showLessFocus,
          showMoreFocus
        )
      )
    );
  }

  private renderValue(
    facetValue: FacetValue,
    onClick: () => void,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean,
    showLessFocus: FocusTargetController,
    showMoreFocus: FocusTargetController
  ) {
    const displayValue = getFieldValueCaption(
      this.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';
    switch (this.displayValuesAs) {
      case 'checkbox':
        return (
          <FacetValueCheckbox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facet.state.facetSearch.query}
            buttonRef={(element) => {
              isShowLessFocusTarget && showLessFocus.setTarget(element);
              isShowMoreFocusTarget && showMoreFocus.setTarget(element);
            }}
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facet.state.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueCheckbox>
        );
      case 'link':
        return (
          <FacetValueLink
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facet.state.facetSearch.query}
            buttonRef={(element) => {
              isShowLessFocusTarget && showLessFocus.setTarget(element);
              isShowMoreFocusTarget && showMoreFocus.setTarget(element);
            }}
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facet.state.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueLink>
        );
      case 'box':
        return (
          <FacetValueBox
            displayValue={displayValue}
            numberOfResults={facetValue.numberOfResults}
            isSelected={isSelected}
            i18n={this.bindings.i18n}
            onClick={onClick}
            searchQuery={this.facet.state.facetSearch.query}
            buttonRef={(element) => {
              isShowLessFocusTarget && showLessFocus.setTarget(element);
              isShowMoreFocusTarget && showMoreFocus.setTarget(element);
            }}
          >
            <FacetValueLabelHighlight
              displayValue={displayValue}
              isSelected={isSelected}
              searchQuery={this.facet.state.facetSearch.query}
            ></FacetValueLabelHighlight>
          </FacetValueBox>
        );
    }
  }

  private renderShowMoreLess(
    showLessFocus: FocusTargetController,
    showMoreFocus: FocusTargetController
  ) {
    return (
      <FacetShowMoreLess
        label={this.label}
        i18n={this.bindings.i18n}
        onShowMore={() => {
          this.resultIndexToFocusOnShowMore = this.facet.state.values.length;
          showMoreFocus.focusAfterSearch();
          this.facet.showMoreValues();
        }}
        onShowLess={() => {
          showLessFocus.focusAfterSearch();
          this.facet.showLessValues();
        }}
        canShowMoreValues={this.facet.state.canShowMoreValues}
        canShowLessValues={this.facet.state.canShowLessValues}
      ></FacetShowMoreLess>
    );
  }

  public renderBody(
    showLessFocus: FocusTargetController,
    showMoreFocus: FocusTargetController
  ) {
    return [
      this.renderSearchInput(),
      shouldDisplaySearchResults(this.facet.state.facetSearch)
        ? [
            this.renderSearchResults(showLessFocus, showMoreFocus),
            this.renderMatches(),
          ]
        : [
            this.renderValues(showLessFocus, showMoreFocus),
            this.renderShowMoreLess(showLessFocus, showMoreFocus),
          ],
    ];
  }

  public render({
    hasError,
    firstSearchExecuted,
    isCollapsed,
    numberOfValues,
    headerFocus,
    showLessFocus,
    showMoreFocus,
    onToggleCollapse,
  }: FacetCommonRenderProps) {
    if (hasError || !this.facet.state.enabled) {
      return <Hidden></Hidden>;
    }

    if (!firstSearchExecuted) {
      return (
        <FacetPlaceholder
          numberOfValues={numberOfValues}
          isCollapsed={isCollapsed}
        ></FacetPlaceholder>
      );
    }

    if (!this.facet.state.values.length) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader(headerFocus, isCollapsed, onToggleCollapse)}
        {!isCollapsed && this.renderBody(showLessFocus, showMoreFocus)}
      </FacetContainer>
    );
  }
}
