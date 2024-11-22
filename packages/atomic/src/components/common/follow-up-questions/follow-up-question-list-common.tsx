import {
  SearchBox,
  SearchBoxState,
  SearchStatus,
  SearchStatusState,
  Unsubscribe,
} from '@coveo/headless';
import {h, State} from '@stencil/core';
import {AnyBindings} from '../../../components';

interface FollowUpQuestionListCommonOptions {
  host: HTMLElement;
  answerConfigurationId?: string;
  getBindings: () => AnyBindings;
  getSearchBox: () => SearchBox | undefined;
  getSearchBoxState: () => SearchBoxState | undefined;
  getSearchStatus: () => SearchStatus | undefined;
  getSearchStatusState: () => SearchStatusState | undefined;
  subscribeToQueryChange?: (handler: (query: string) => void) => Unsubscribe;
}

export class FollowUpQuestionListCommon {
  //   @Element() private host!: Element;

  //   private bindings?: Bindings;

  private error?: Error;

  //   private searchBoxController!: SearchBox;
  //   private statusController!: SearchStatus;

  //   private searchBoxUnsubscribe: Unsubscribe = () => {};
  //   private statusUnsubscribe: Unsubscribe = () => {};

  //   @State() private searchBoxState!: SearchBoxState;
  //   @State() private statusState!: SearchStatusState;

  private unsubscribeToQueryChange: Unsubscribe = () => {};

  @State() private questions: {text: string}[] = [];

  // // TODO: Pass this value as a component option
  // @Prop() public answerConfigurationId: string = '';

  constructor(private props: FollowUpQuestionListCommonOptions) {}

  // public async connectedCallback() {
  //   try {
  //     await waitForAtomic();
  //     this.bindings = await initializeBindings(this.host);

  //     this.searchBoxController = buildSearchBox(this.bindings.engine);
  //     this.statusController = buildSearchStatus(this.bindings.engine);

  //     this.searchBoxUnsubscribe = this.searchBoxController.subscribe(() =>
  //       this.handleSearchBoxUpdate()
  //     );
  //     this.statusUnsubscribe = this.statusController.subscribe(
  //       () => (this.statusState = this.statusController.state)
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     this.error = error as Error;
  //   }
  // }

  public async connectedCallback() {
    if (this.props.subscribeToQueryChange) {
      this.unsubscribeToQueryChange = this.props.subscribeToQueryChange(
        (query: string) => this.handleQueryChanged(query)
      );
    }
  }

  public async disconnectedCallback() {
    this.unsubscribeToQueryChange?.();
  }

  // public async disconnectedCallback() {
  //   this.searchBoxUnsubscribe?.();
  //   this.statusUnsubscribe?.();
  // }

  public render() {
    if (this.error) {
      return (
        <p>
          Error when initializing the component, please view the console for
          information.
        </p>
      );
    }

    if (
      !this.props.getBindings() ||
      this.props.getSearchStatusState()?.isLoading ||
      !this.props.getSearchStatusState()?.hasResults
    ) {
      return;
    }

    return (
      <div class="question-list">
        {this.questions.map((question) => (
          <atomic-follow-up-question
            text={question.text}
            onSelect={(text: string) => this.handleQuestionSelected(text)}
          ></atomic-follow-up-question>
        ))}
      </div>
    );
  }

  private handleQuestionSelected(text: string) {
    this.props.getSearchBox()?.updateText(text);
    this.props.getSearchBox()?.submit();
  }

  // private handleSearchBoxUpdate() {
  //   if (this.searchBoxController.state?.value !== this.searchBoxState?.value) {
  //     this.handleQueryChanged();
  //   }

  //   this.searchBoxState = this.searchBoxController.state;
  // }

  private handleQueryChanged(query: string) {
    // TODO: Call the Answer API to get the follow up questions...

    const possibleQuestions = [
      'What is Coveo?',
      'What is ITD?',
      'What is Coveo RGA?',
      'What is Smart Snippets?',
      'How to create a custom Atomic component?',
      'How to index items using the Push API?',
      'Which API key privileges should I use with a public hosted search page?',
    ];

    const nbQuestions = 3;

    const questions: {text: string}[] = [];
    for (let i = 0; i < nbQuestions; i++) {
      const idx = Math.floor(Math.random() * possibleQuestions.length);
      questions.push({text: possibleQuestions[idx]});
    }

    // Clear the follow-up questions first
    this.questions = [];

    setTimeout(() => {
      this.questions = query ? questions : [];
    }, 500);
  }
}
