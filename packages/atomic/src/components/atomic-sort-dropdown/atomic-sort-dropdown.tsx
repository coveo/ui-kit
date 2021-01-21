import {Component, h, State} from '@stencil/core';
import {
  Sort,
  SortState,
  SortInitialState,
  buildSort,
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  SortOrder,
} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

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
  styleUrl: 'atomic-sort-dropdown.pcss',
  shadow: true,
})
export class AtomicSortDropdown implements AtomicComponentInterface {
  @State() controllerState!: SortState;

  public bindings!: Bindings;
  public controller!: Sort;

  @Initialization()
  public initialize() {
    const initialState: Partial<SortInitialState> = {criterion: this.relevance};
    this.controller = buildSort(this.bindings.engine, {initialState});
  }

  private select(e: Event) {
    const select = e.composedPath()[0] as HTMLSelectElement;

    switch (select.value) {
      case SortOption.Relevance:
        this.controller.sortBy(this.relevance);
        break;

      case SortOption.Newest:
        this.controller.sortBy(this.dateDescending);
        break;

      case SortOption.Oldest:
        this.controller.sortBy(this.dateAscending);
        break;

      case SortOption.Size:
        this.controller.sortBy(this.largest);
        break;

      default:
        break;
    }
  }

  private get relevance() {
    return buildRelevanceSortCriterion();
  }

  private get dateDescending() {
    return buildDateSortCriterion(SortOrder.Descending);
  }

  private get dateAscending() {
    return buildDateSortCriterion(SortOrder.Ascending);
  }

  private get largest() {
    return buildFieldSortCriterion('size', SortOrder.Descending);
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
          selected={this.controller.isSortedBy(this.relevance)}
        >
          Relevance
        </option>
        <option
          value={SortOption.Newest}
          selected={this.controller.isSortedBy(this.dateDescending)}
        >
          Newest
        </option>
        <option
          value={SortOption.Oldest}
          selected={this.controller.isSortedBy(this.dateAscending)}
        >
          Oldest
        </option>
        <option
          value={SortOption.Size}
          selected={this.controller.isSortedBy(this.largest)}
        >
          Largest Size
        </option>
      </select>
    );
  }
}
