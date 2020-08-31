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
import {EngineProvider, EngineProviderError} from '../../utils/engine-utils';
import {RenderError} from '../../utils/render-utils';

enum SortOption {
  Relevance = 'relevance',
  Newest = 'newest',
  Oldest = 'oldest',
  Size = 'size',
}

@Component({
  tag: 'atomic-sort-dropdown',
  styleUrl: 'atomic-sort-dropdown.css',
  shadow: true,
})
export class AtomicSortDropdown {
  @State() state!: SortState;
  @EngineProvider() engine!: Engine;
  @RenderError() error?: Error;

  private sort!: Sort;
  private unsubscribe: Unsubscribe = () => {};

  public componentWillLoad() {
    try {
      this.configure();
    } catch (error) {
      this.error = error;
    }
  }

  private configure() {
    if (!this.engine) {
      throw new EngineProviderError('atomic-sort-dropdown');
    }

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
      <select name="sorts" onChange={(val) => this.select(val)}>
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
