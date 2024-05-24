import {Schema, StringValue} from '@coveo/bueno';
import {
  Sort,
  buildSort,
  SortState,
  parseCriterionExpression,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, State, Element} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {SortContainer} from '../../common/sort/container';
import {SortGuard} from '../../common/sort/guard';
import {SortLabel} from '../../common/sort/label';
import {SortOption} from '../../common/sort/option';
import {SortSelect} from '../../common/sort/select';
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
      sortExpressionElements.map(({expression, label}) => {
        new Schema({
          label: new StringValue({emptyAllowed: false, required: true}),
        }).validate({label});

        return {
          criteria: parseCriterionExpression(expression),
          expression,
          label,
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
