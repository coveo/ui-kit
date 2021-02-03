import {Component, h, State, Element, Prop} from '@stencil/core';
import {
  Sort,
  buildSort,
  SortState,
  SortCriterion,
  parseCriterionExpression,
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

interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  caption: string;
}

/**
 * The Sort Dropdown allows the end user to select the criteria to use when sorting query results.
 *
 * @part label - The "Sort by" label
 * @part select - The select element
 */
@Component({
  tag: 'atomic-sort-dropdown',
  styleUrl: 'atomic-sort-dropdown.pcss',
  shadow: true,
})
export class AtomicSortDropdown implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private sort!: Sort;
  private options: SortDropdownOption[] = [];
  private id = randomID('atomic-sort-dropdown-');

  @Element() host!: HTMLElement;

  @State() @BindStateToController('sort') public sortState!: SortState;
  @BindStateToI18n() @State() private strings: I18nState = {
    sortBy: () => this.bindings.i18n.t('sortBy'),
  };
  @State() public error!: Error;

  /**
   * Specifies whether a label should be displayed in front of the dropdown.
   */
  @Prop({reflect: true}) displayLabel = true;

  public initialize() {
    this.buildOptions();
    this.sort = buildSort(this.bindings.engine, {
      initialState: {
        criterion: this.options[0].criteria,
      },
    });
  }

  private buildOptions() {
    const sortCriterionElements = Array.from(
      this.host.querySelectorAll('atomic-sort-criteria')
    );

    this.options = sortCriterionElements.map(({criteria, caption}) => {
      this.strings[caption] = () => this.bindings.i18n.t(caption);

      return {
        criteria: parseCriterionExpression(criteria),
        expression: criteria,
        caption,
      };
    });

    if (!this.options.length) {
      this.error = new Error(
        'The "atomic-sort-dropdown" element requires at least one "atomic-sort-criteria" child.'
      );
    }
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
    if (!this.displayLabel) {
      return;
    }

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
        class="flex-grow appearance-none rounded bg-background text-secondary font-bold border border-divider py-1.5 pl-2 pr-5"
        part="select"
        aria-label={this.strings.sortBy()}
        onChange={(option) => this.select(option)}
      >
        {this.options.map((option) => this.buildOption(option))}
      </select>,
      <div
        class="absolute right-3 top-4 fill-current w-3 h-3 pointer-events-none"
        innerHTML={ArrowBottomIcon}
      ></div>,
    ];
  }

  public render() {
    return [
      <div class="flex items-center relative">
        {this.renderLabel()}
        {this.renderSelect()}
      </div>,
      <slot></slot>,
    ];
  }
}
