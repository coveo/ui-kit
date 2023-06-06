import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-generated-answer',
  styleUrl: 'atomic-generated-answer.pcss',
  shadow: true,
})
export class AtomicGeneratedAnswer implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public generatedAnswer!: GeneratedAnswer;
  public searchStatus!: SearchStatus;

  @BindStateToController('generatedAnswer')
  @State()
  private generatedAnswerState!: GeneratedAnswerState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  @State()
  public error!: Error;

  @State()
  hidden = true;

  public initialize() {
    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
  }

  private get loader() {
    return (
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  public render() {
    if (
      !this.generatedAnswerState.answer?.length ||
      this.searchStatusState.hasError
    ) {
      return null;
    }
    return (
      <aside
        class="bg-background border border-neutral rounded-lg p-6 pb-4 text-on-background"
        part="container"
      >
        <article>
          {this.generatedAnswerState.isLoading ? (
            this.loader
          ) : (
            <div part="generated-content">
              <div part="badge">Generated answer for you</div>
              <p part="text">{this.generatedAnswerState.answer}</p>
            </div>
          )}
        </article>
      </aside>
    );
  }
}
