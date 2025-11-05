import {Schema, StringValue} from '@coveo/bueno';
import {
  Sort,
  buildSort,
  SortState,
  parseCriterionExpression,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  TabManager,
  TabManagerState,
  buildTabManager,
  loadSortCriteriaActions,
} from '@coveo/headless';
import {Component, h, State, Element} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {shouldDisplayOnCurrentTab} from '../../../utils/tab-utils';
import {randomID} from '../../../utils/utils';
import {SortContainer} from '../../common/sort/stencil-container';
import {SortGuard} from '../../common/sort/stencil-guard';
import {SortLabel} from '../../common/sort/stencil-label';
import {SortOption} from '../../common/sort/stencil-option';
import {SortSelect} from '../../common/sort/stencil-select';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-sort-dropdown` component renders a dropdown that the end user can interact with to select the criteria to use when sorting query results.
 *
 * @slot default - The `atomic-sort-expression` of the dropdown are slotted in.
 *
 * @part label - The "Sort by" label of the `<select>` element.
 * @part select-parent - The `<select>` element parent.
 * @part select - The `<select>` element of the dropdown list.
 * @part select-separator - The element separating the select from the icon.
 * @part placeholder - The dropdown placeholder for while the search interface is initializing.
 */
@Component({
  tag: 'atomic-sort-dropdown',
  styleUrl: 'atomic-sort-dropdown.pcss',
  shadow: true,
})
export class AtomicSortDropdown implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private sort!: Sort;
  public searchStatus!: SearchStatus;
  private id!: string;

  @Element() host!: HTMLElement;

  @State() @BindStateToController('sort') public sortState!: SortState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  public tabManager!: TabManager;
  @BindStateToController('tabManager')
  @State()
  public tabManagerState!: TabManagerState;
  @State() public error!: Error;

  connectedCallback(): void {
    this.id ||= randomID('atomic-sort-dropdown-');
  }

  public initialize() {
    this.buildOptions();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine, {
      initialState: {
        criterion: this.bindings.store.state.sortOptions[0]?.criteria,
      },
    });
    this.tabManager = buildTabManager(this.bindings.engine);
  }

  private buildOptions() {
    const sortExpressionElements = Array.from(
      this.host.querySelectorAll('atomic-sort-expression')
    );

    if (!sortExpressionElements.length) {
      this.error = new Error(
        'The "atomic-sort-dropdown" element requires at least one "atomic-sort-expression" child.'
      );
      return;
    }

    this.bindings.store.state.sortOptions = sortExpressionElements.map(
      ({expression, label, tabsIncluded, tabsExcluded}) => {
        new Schema({
          label: new StringValue({emptyAllowed: false, required: true}),
        }).validate({label});

        return {
          tabs: {
            included: tabsIncluded,
            excluded: tabsExcluded,
          },
          criteria: parseCriterionExpression(expression),
          expression,
          label,
        };
      }
    );
  }

  private get options() {
    return this.bindings.store.state.sortOptions.filter(({tabs}) =>
      shouldDisplayOnCurrentTab(
        [...tabs.included],
        [...tabs.excluded],
        this.tabManagerState?.activeTab
      )
    );
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const option = this.options.find(
      (option) => option.expression === select.value
    );
    option && this.sort.sortBy(option.criteria);
  }

  public componentShouldUpdate(): void {
    if (
      this.options.some(
        (option) =>
          option.expression.trim().replace(/\s*,\s*/g, ',') ===
          this.sortState.sortCriteria.replace(/@/g, '')
      )
    ) {
      return;
    }

    const action = loadSortCriteriaActions(
      this.bindings.engine
    ).updateSortCriterion(this.options[0]?.criteria);

    this.bindings.engine.dispatch(action);
  }

  public render() {
    const {hasError, hasResults, firstSearchExecuted} = this.searchStatusState;
    const {
      bindings: {i18n},
      id,
    } = this;

    return [
      <SortGuard
        firstSearchExecuted={firstSearchExecuted}
        hasError={hasError}
        hasResults={hasResults}
      >
        <SortContainer>
          <SortLabel i18n={i18n} id={id} />
          <SortSelect i18n={i18n} id={id} onSelect={(evt) => this.select(evt)}>
            {this.options.map(({label, criteria, expression}) => (
              <SortOption
                i18n={i18n}
                label={label}
                selected={this.sort.isSortedBy(criteria)}
                value={expression}
              />
            ))}
          </SortSelect>
        </SortContainer>
      </SortGuard>,
      <slot></slot>,
    ];
  }
}
