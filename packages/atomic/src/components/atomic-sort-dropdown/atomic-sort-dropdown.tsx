import {Component, h, State, Element} from '@stencil/core';
import {
  Sort,
  buildSort,
  SortState,
  parseCriterionExpression,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';
import {SortDropdownOption} from '../../utils/store';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import {Schema, StringValue} from '@coveo/bueno';

/**
 * The `atomic-sort-dropdown` component renders a dropdown that the end user can interact with to select the criteria to use when sorting query results.
 *
 * @part label - The "Sort by" label of the `<select>` element.
 * @part select - The `<select>` element of the drop-down list.
 * @part select-separator - The element separating the select from the icon.
 * @part placeholder - The drop-down placeholder for while the search interface is initializing.
 *
 * @part ripple - The ripple effect of the component's interactive elements.
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
  private id = randomID('atomic-sort-dropdown-');

  @Element() host!: HTMLElement;

  @State() @BindStateToController('sort') public sortState!: SortState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @State() public error!: Error;

  public initialize() {
    this.buildOptions();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine, {
      initialState: {
        criterion: this.bindings.store.state.sortOptions[0]?.criteria,
      },
    });
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

    this.bindings.store.set(
      'sortOptions',
      sortExpressionElements.map(({expression, caption}) => {
        new Schema({
          caption: new StringValue({emptyAllowed: false, required: true}),
        }).validate({caption});

        return {
          criteria: parseCriterionExpression(expression),
          expression,
          caption,
        };
      })
    );
  }

  private get options() {
    return this.bindings.store.state.sortOptions;
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;
    const option = this.options.find(
      (option) => option.expression === select.value
    );
    option && this.sort.sortBy(option.criteria);
  }

  private buildOption({expression, criteria, caption}: SortDropdownOption) {
    return (
      <option value={expression} selected={this.sort.isSortedBy(criteria)}>
        {this.bindings.i18n.t(caption)}
      </option>
    );
  }

  private renderLabel() {
    return (
      <label
        class="m-2 font-bold text-sm with-colon cursor-pointer"
        part="label"
        htmlFor={this.id}
      >
        {this.bindings.i18n.t('sort-by')}
      </label>
    );
  }

  private renderSelect() {
    return (
      <div class="relative">
        <select
          id={this.id}
          class="btn-outline-neutral h-10 flex-grow cursor-pointer appearance-none pl-3 pr-24"
          part="select"
          aria-label={this.bindings.i18n.t('sort-by')}
          onChange={(option) => this.select(option)}
        >
          {this.options.map((option) => this.buildOption(option))}
        </select>
        <div
          part="select-separator"
          class="w-10 absolute pointer-events-none top-px bottom-px right-0 border-l border-neutral flex justify-center items-center"
        >
          <atomic-icon class="w-2.5" icon={ArrowBottomIcon}></atomic-icon>
        </div>
      </div>
    );
  }

  public render() {
    if (this.searchStatusState.hasError) {
      return;
    }

    if (!this.searchStatusState.firstSearchExecuted) {
      return (
        <div
          part="placeholder"
          aria-hidden
          class="rounded h-6 my-2 w-44 bg-neutral animate-pulse"
        ></div>
      );
    }

    if (!this.searchStatusState.hasResults) {
      return;
    }

    return [
      <div class="flex items-center flex-wrap text-on-background">
        {this.renderLabel()}
        {this.renderSelect()}
      </div>,
      <slot></slot>,
    ];
  }
}
