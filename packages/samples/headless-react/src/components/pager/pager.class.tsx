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

  private previousPage() {
    this.controller.previousPage();
  }

  private nextPage() {
    this.controller.nextPage();
  }

  private selectPage(page: number) {
    this.controller.selectPage(page);
  }

  private isCurrentPage(page: number) {
    return this.controller.isCurrentPage(page);
  }

  render() {
    return (
      <nav>
        <button
          disabled={!this.state.hasPreviousPage}
          onClick={() => this.previousPage()}
        >
          {'<'}
        </button>
        {this.state.currentPages.map((page) => (
          <button
            key={page}
            disabled={this.isCurrentPage(page)}
            onClick={() => this.selectPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          disabled={!this.state.hasNextPage}
          onClick={() => this.nextPage()}
        >
          {'>'}
        </button>
      </nav>
    );
  }
}
