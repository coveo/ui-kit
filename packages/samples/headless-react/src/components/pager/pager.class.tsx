import {Component, ContextType} from 'react';
import {
  buildPager,
  Pager as HeadlessPager,
  PagerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class Pager extends Component<{}, PagerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessPager;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildPager(this.context.engine!, {
      options: {numberOfPages: 6},
    });
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state) {
      return null;
    }

    return (
      <nav>
        <button
          disabled={!this.state.hasPreviousPage}
          onClick={() => this.controller.previousPage()}
        >
          {'<'}
        </button>
        {this.state.currentPages.map((page) => (
          <button
            key={page}
            disabled={this.controller.isCurrentPage(page)}
            onClick={() => this.controller.selectPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          disabled={!this.state.hasNextPage}
          onClick={() => this.controller.nextPage()}
        >
          {'>'}
        </button>
      </nav>
    );
  }
}
