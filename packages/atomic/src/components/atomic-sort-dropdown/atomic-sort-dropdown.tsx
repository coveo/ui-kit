import {Component, h, State} from '@stencil/core';
import {
  Sort,
  SortState,
  SortInitialState,
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  Unsubscribe,
  buildSort,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

enum SortOption {
  Relevance = 'relevance',
  Newest = 'newest',
  Oldest = 'oldest',
  Size = 'size',
}

/**
 * @part select - The select element
 */
@Component({
  tag: 'atomic-sort-dropdown',
  styleUrl: 'atomic-sort-dropdown.scss',
  shadow: true,
})
export class AtomicSortDropdown {
  @State() state!: SortState;

  private engine!: Engine;
  private sort!: Sort;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    const initialState: Partial<SortInitialState> = {criterion: this.relevance};
    this.sort = buildSort(this.engine, {initialState});
    this.unsubscribe = this.sort.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.sort.state;
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;

    switch (select.value) {
      case SortOption.Relevance:
        this.sort.sortBy(this.relevance);
        break;

      case SortOption.Newest:
        this.sort.sortBy(this.dateDescending);
        break;

      case SortOption.Oldest:
        this.sort.sortBy(this.dateAscending);
        break;

      case SortOption.Size:
        this.sort.sortBy(this.largest);
        break;

      default:
        break;
    }
  }

  private get relevance() {
    return buildRelevanceSortCriterion();
  }

  private get dateDescending() {
    return buildDateSortCriterion('descending');
  }

  private get dateAscending() {
    return buildDateSortCriterion('ascending');
  }

  private get largest() {
    return buildFieldSortCriterion('size', 'descending');
  }

  render() {
    return (
      <select
        class="form-select"
        aria-label="Sort results by"
        part="select"
        name="sorts"
        onChange={(val) => this.select(val)}
      >
        <option
          value={SortOption.Relevance}
          selected={this.sort.isSortedBy(this.relevance)}
        >
          Relevance
        </option>
        <option
          value={SortOption.Newest}
          selected={this.sort.isSortedBy(this.dateDescending)}
        >
          Newest
        </option>
        <option
          value={SortOption.Oldest}
          selected={this.sort.isSortedBy(this.dateAscending)}
        >
          Oldest
        </option>
        <option
          value={SortOption.Size}
          selected={this.sort.isSortedBy(this.largest)}
        >
          Largest Size
        </option>
      </select>
    );
  }
}
