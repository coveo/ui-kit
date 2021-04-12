import {Component, h, State, Element} from '@stencil/core';
import {
  Sort,
  buildSort,
  SortState,
  SortCriterion,
  parseCriterionExpression,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  BindStateToI18n,
  I18nState,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
import {randomID} from '../../utils/utils';
import ArrowBottomIcon from 'coveo-styleguide/resources/icons/svg/arrow-bottom-rounded.svg';
import {Schema, StringValue} from '@coveo/bueno';

interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  caption: string;
}

/**
 * The `atomic-sort-dropdown` component renders a dropdown that the end user can interact with to
 * select the criteria to use when sorting query results.
 *
 * @part label - The "Sort by" label
 * @part select - The select element
 * @part placeholder - The initialization placeholder
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
  private options: SortDropdownOption[] = [];
  private id = randomID('atomic-sort-dropdown-');

  @Element() host!: HTMLElement;

  @State() @BindStateToController('sort') public sortState!: SortState;
  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToI18n() @State() private strings: I18nState = {
    sortBy: () => this.bindings.i18n.t('sortBy'),
  };
  @State() public error!: Error;

  public initialize() {
    this.buildOptions();
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.sort = buildSort(this.bindings.engine, {
      initialState: {
        criterion: this.options[0]?.criteria,
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

    this.options = sortExpressionElements.map(({expression, caption}) => {
      new Schema({
        caption: new StringValue({emptyAllowed: false, required: true}),
      }).validate({caption});
      this.strings[caption] = () => this.bindings.i18n.t(caption);

      return {
        criteria: parseCriterionExpression(expression),
        expression,
        caption,
      };
    });
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
        {this.strings[caption]()}
      </option>
    );
  }

  private renderLabel() {
    return (
      <label
        class="text-on-background text-sm mr-2"
        part="label"
        htmlFor={this.id}
      >
        {this.strings.sortBy()}
      </label>
    );
  }

  private renderSelect() {
    return [
      <select
        id={this.id}
        class="flex-grow appearance-none rounded bg-background text-secondary font-bold border border-divider py-1.5 pl-2 pr-8"
        part="select"
        aria-label={this.strings.sortBy()}
        onChange={(option) => this.select(option)}
      >
        {this.options.map((option) => this.buildOption(option))}
      </select>,
      <div
        class="absolute pointer-events-none right-3 fill-current w-3"
        innerHTML={ArrowBottomIcon}
      ></div>,
    ];
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
          class="h-6 my-2 w-44 bg-divider animate-pulse"
        ></div>
      );
    }

    return [
      <div class="flex items-center relative">
        {this.renderLabel()}
        {this.renderSelect()}
      </div>,
      <slot></slot>,
    ];
  }
}
