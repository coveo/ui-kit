import {Component, h, State} from '@stencil/core';
import {
  ResultsPerPage,
  ResultsPerPageState,
  Unsubscribe,
  buildResultsPerPage,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-results-per-page',
  styleUrl: 'atomic-results-per-page.css',
  shadow: true,
})
export class AtomicResultsPerPage {
  @State() state!: ResultsPerPageState;

  private engine!: Engine;
  private resultsPerPage!: ResultsPerPage;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.resultsPerPage = buildResultsPerPage(this.engine);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.resultsPerPage.state;
  }

  private get buttons() {
    return [10, 25, 50, 100].map((num) => {
      const isSelected = this.resultsPerPage.isSetTo(num);
      const className = isSelected ? 'active' : '';
      return (
        <button class={className} onClick={() => this.resultsPerPage.set(num)}>
          {num}
        </button>
      );
    });
  }

  public render() {
    return <div>{this.buttons}</div>;
  }
}
