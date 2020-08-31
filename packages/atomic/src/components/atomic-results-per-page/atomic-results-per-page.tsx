import {Component, h, State} from '@stencil/core';
import {
  ResultsPerPage,
  ResultsPerPageState,
  Unsubscribe,
  buildResultsPerPage,
  Engine,
} from '@coveo/headless';
import {EngineProviderError, EngineProvider} from '../../utils/engine-utils';
import {RenderError} from '../../utils/render-utils';

@Component({
  tag: 'atomic-results-per-page',
  styleUrl: 'atomic-results-per-page.css',
  shadow: true,
})
export class AtomicResultsPerPage {
  @State() state!: ResultsPerPageState;
  @EngineProvider() engine!: Engine;
  @RenderError() error?: Error;

  private resultsPerPage!: ResultsPerPage;
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
      throw new EngineProviderError('atomic-results-per-page');
    }

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
