import {Component} from 'react';
import {
  buildPager,
  Pager as HeadlessPager,
  PagerOptions,
  PagerState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class Pager extends Component {
  private controller: HeadlessPager;
  public state: PagerState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    const options: PagerOptions = {numberOfPages: 6};
    this.controller = buildPager(engine, {options});
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
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
