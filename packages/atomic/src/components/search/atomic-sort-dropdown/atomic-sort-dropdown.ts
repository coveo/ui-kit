import {Schema, StringValue} from '@coveo/bueno';
import {
  buildSearchStatus,
  buildSort,
  buildTabManager,
  loadSortCriteriaActions,
  parseCriterionExpression,
  type SearchStatus,
  type SearchStatusState,
  type Sort,
  type SortState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {guard} from 'lit/directives/guard.js';
import {map} from 'lit/directives/map.js';
import {renderSortLabel} from '@/src/components/common/sort/label';
import {renderSortOption} from '@/src/components/common/sort/option';
import {renderSortSelect} from '@/src/components/common/sort/select';
import {sortGuard} from '@/src/components/common/sort/sort-guard';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {shouldDisplayOnCurrentTab} from '@/src/utils/tab-utils';
import {randomID} from '@/src/utils/utils';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
@customElement('atomic-sort-dropdown')
@bindings()
@withTailwindStyles
export class AtomicSortDropdown
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() bindings!: Bindings;

  private readonly dropdownId = randomID('atomic-sort-dropdown-');

  public sort!: Sort;
  @bindStateToController('sort')
  @state()
  public sortState!: SortState;

  public searchStatus!: SearchStatus;
  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;

  public tabManager!: TabManager;
  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;

  @state() public error!: Error;

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
      this.querySelectorAll('atomic-sort-expression')
    );

    if (!sortExpressionElements.length) {
      this.error = new Error(
        'The "atomic-sort-dropdown" element requires at least one "atomic-sort-expression" child.'
      );
      return;
    }

    this.bindings.store.state.sortOptions = sortExpressionElements.map(
      (element) => {
        const expression = element.getAttribute('expression') || '';
        const label = element.getAttribute('label') || '';
        const tabsIncluded = JSON.parse(
          element.getAttribute('tabs-included') || '[]'
        );
        const tabsExcluded = JSON.parse(
          element.getAttribute('tabs-excluded') || '[]'
        );

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

  updated() {
    if (!this.bindings || !this.sortState) {
      return;
    }

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

  private renderSortLabelTemplate() {
    return renderSortLabel({
      props: {
        id: this.dropdownId,
        i18n: this.bindings.i18n,
      },
    });
  }

  private renderSortSelectTemplate() {
    const {
      bindings: {i18n},
      dropdownId: id,
    } = this;

    return renderSortSelect({
      props: {
        i18n,
        id,
        onSelect: (evt: Event) => this.select(evt),
      },
    })(
      html`${guard([this.sortState, this.options], () =>
        map(this.options, ({label, criteria, expression}) =>
          renderSortOption({
            props: {
              i18n,
              label,
              selected: this.sort.isSortedBy(criteria),
              value: expression,
            },
          })
        )
      )}`
    );
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const {hasError, hasResults, firstSearchExecuted, isLoading} =
      this.searchStatusState;

    return html`
      ${sortGuard(
        {
          isLoading,
          firstSearchExecuted,
          hasResults,
          hasError,
        },
        () =>
          html`<div class="text-on-background flex flex-wrap items-center">
            ${this.renderSortLabelTemplate()} ${this.renderSortSelectTemplate()}
          </div>`
      )}
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-sort-dropdown': AtomicSortDropdown;
  }
}
