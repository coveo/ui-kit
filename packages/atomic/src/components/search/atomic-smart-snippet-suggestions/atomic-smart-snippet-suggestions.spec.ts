import {
  buildSmartSnippetQuestionsList,
  type Result,
  type SmartSnippetRelatedQuestion,
} from '@coveo/headless';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {
  buildFakeRelatedQuestion,
  buildFakeSmartSnippetQuestionsList,
} from '@/vitest-utils/testing-helpers/fixtures/headless/search/smart-snippet-questions-list-controller';
import type {AtomicSmartSnippetSuggestions} from './atomic-smart-snippet-suggestions';
import './atomic-smart-snippet-suggestions';

vi.mock('@coveo/headless', {spy: true});

type SmartSnippetQuestionsListFixtureOptions = NonNullable<
  Parameters<typeof buildFakeSmartSnippetQuestionsList>[0]
>;

describe('atomic-smart-snippet-suggestions', () => {
  const mockEngine = buildFakeSearchEngine();
  let mockController: ReturnType<typeof buildFakeSmartSnippetQuestionsList>;

  const renderComponent = async ({
    props = {},
    slottedContent,
    controllerImplementation = {},
    controllerState = {},
  }: {
    props?: Partial<{
      headingLevel: number;
      snippetStyle: string;
    }>;
    slottedContent?: string;
    controllerImplementation?: SmartSnippetQuestionsListFixtureOptions['implementation'];
    controllerState?: SmartSnippetQuestionsListFixtureOptions['state'];
  } = {}) => {
    mockController = buildFakeSmartSnippetQuestionsList({
      implementation: controllerImplementation,
      state: controllerState,
    });
    vi.mocked(buildSmartSnippetQuestionsList).mockReturnValue(mockController);

    const template = slottedContent
      ? html`<atomic-smart-snippet-suggestions
          heading-level=${props.headingLevel ?? 0}
          snippet-style=${props.snippetStyle ?? ''}
        >
          ${unsafeHTML(slottedContent)}
        </atomic-smart-snippet-suggestions>`
      : html`<atomic-smart-snippet-suggestions
          heading-level=${props.headingLevel ?? 0}
          snippet-style=${props.snippetStyle ?? ''}
        ></atomic-smart-snippet-suggestions>`;

    const {element} =
      await renderInAtomicSearchInterface<AtomicSmartSnippetSuggestions>({
        template,
        selector: 'atomic-smart-snippet-suggestions',
        bindings: (bindings) => {
          bindings.engine = mockEngine;
          return bindings;
        },
      });

    return {
      element,
      locators: {
        container: () =>
          element.shadowRoot?.querySelector('[part="container"]'),
        heading: () => element.shadowRoot?.querySelector('[part="heading"]'),
        questions: () =>
          element.shadowRoot?.querySelector('[part="questions"]'),
        questionAnswers: () =>
          element.shadowRoot?.querySelectorAll('[part^="question-answer"]')!,
        questionAnswerCollapsed: () =>
          element.shadowRoot?.querySelector(
            '[part="question-answer-collapsed"]'
          ),
        questionAnswerExpanded: () =>
          element.shadowRoot?.querySelector(
            '[part="question-answer-expanded"]'
          ),
        questionAnswersCollapsed: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-answer-collapsed"]'
          )!,
        questionAnswersExpanded: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-answer-expanded"]'
          )!,

        questionButtonCollapsed: () =>
          element.shadowRoot?.querySelector(
            '[part="question-button-collapsed"]'
          ),
        questionButtonsCollapsed: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-button-collapsed"]'
          )!,
        questionButtonExpanded: () =>
          element.shadowRoot?.querySelector(
            '[part="question-button-expanded"]'
          ),
        questionButtonsExpanded: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-button-expanded"]'
          )!,
        questionIconCollapsed: () =>
          element.shadowRoot?.querySelector('[part="question-icon-collapsed"]'),
        questionIconsCollapsed: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-icon-collapsed"]'
          )!,
        questionIconExpanded: () =>
          element.shadowRoot?.querySelector('[part="question-icon-expanded"]'),
        questionIconsExpanded: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-icon-expanded"]'
          )!,
        questionTextCollapsed: () =>
          element.shadowRoot?.querySelector('[part="question-text-collapsed"]'),
        questionTextsCollapsed: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-text-collapsed"]'
          )!,
        questionTextExpanded: () =>
          element.shadowRoot?.querySelector('[part="question-text-expanded"]'),
        questionTextsExpanded: () =>
          element.shadowRoot?.querySelectorAll(
            '[part^="question-text-expanded"]'
          )!,
        questionTexts: () =>
          Array.from(
            element.shadowRoot?.querySelectorAll(
              '[part="question-text-collapsed"], [part="question-text-expanded"]'
            )!
          ),
        answerAndSources: () =>
          element.shadowRoot?.querySelectorAll('[part="answer-and-source"]')!,
        smartSnippetAnswer: () =>
          element.shadowRoot?.querySelector('atomic-smart-snippet-answer'),
        smartSnippetSource: () =>
          element.shadowRoot?.querySelector('atomic-smart-snippet-source'),
        footer: () => element.shadowRoot?.querySelector('[part="footer"]'),
      },
    };
  };

  describe('#initialize', () => {
    it('should build controller with engine', async () => {
      const {element} = await renderComponent();
      expect(buildSmartSnippetQuestionsList).toHaveBeenCalledWith(mockEngine);
      expect(element.smartSnippetQuestionsList).toBe(mockController);
    });

    it('should not set error with valid props', async () => {
      const {element} = await renderComponent({
        props: {headingLevel: 2},
      });
      expect(element.error).toBeUndefined();
    });

    // TODO V4: KIT-5197 - Remove skip
    it.skip('should set error when #headingLevel is invalid', async () => {
      const {element} = await renderComponent({
        props: {headingLevel: 6},
      });

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/headingLevel/i);
    });

    // TODO V4: KIT-5197 - Remove this test
    it.each<{
      validValue: number;
      invalidValue: number;
    }>([
      {validValue: 2, invalidValue: -1},
      {validValue: 2, invalidValue: 6},
    ])(
      'should log validation warning when #headingLevel is updated to invalid value',
      async ({validValue, invalidValue}) => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});

        const {element} = await renderComponent({
          props: {headingLevel: validValue},
        });

        // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
        (element as any).headingLevel = invalidValue;
        await element.updateComplete;

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Prop validation failed for component atomic-smart-snippet-suggestions'
          ),
          element
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('headingLevel'),
          element
        );

        consoleWarnSpy.mockRestore();
      }
    );

    // TODO V4: KIT-5197 - Remove skip
    it.skip('should set error when valid #headingLevel is updated to an invalid value', async () => {
      const {element} = await renderComponent({
        props: {headingLevel: 2},
      });

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any).headingLevel = 6;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(/headingLevel/i);
    });
  });

  describe('rendering', () => {
    it('should not render anything when no questions are available', async () => {
      const {locators} = await renderComponent({
        controllerState: {questions: []},
      });
      expect(locators.container()).not.toBeInTheDocument();
    });

    describe('when questions are available', () => {
      const question1 = buildFakeRelatedQuestion({
        questionAnswerId: 'q1',
        question: 'What is Coveo?',
        answer: 'Coveo is a search platform.',
        expanded: false,
      });

      const question2 = buildFakeRelatedQuestion({
        questionAnswerId: 'q2',
        question: 'How does it work?',
        answer: 'It uses AI and machine learning.',
        expanded: true,
      });

      it('should render container with all parts', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        expect(locators.container()).toBeInTheDocument();
        expect(locators.heading()).toBeInTheDocument();
        expect(locators.questions()).toBeInTheDocument();
      });

      it('should render heading with correct text', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        expect(locators.heading()).toHaveTextContent('People also ask');
      });

      it('should render all questions', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1, question2]},
        });
        expect(locators.questionAnswers().length).toBe(2);
      });

      it('should render the correct questions', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1, question2]},
        });

        const questionText = locators
          .questionTexts()
          .map((el) => el.textContent?.trim());

        expect(questionText).toEqual([question1.question, question2.question]);
      });

      it('should render question with collapsed state', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const collapsedQuestion = locators.questionAnswerCollapsed();
        expect(collapsedQuestion).toBeInTheDocument();
      });

      it('should render question with expanded state', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question2]},
        });
        const expandedQuestion = locators.questionAnswerExpanded();
        expect(expandedQuestion).toBeInTheDocument();
      });

      it('should render question button with correct text', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const button = locators.questionButtonCollapsed();
        expect(button).toHaveTextContent('What is Coveo?');
      });

      it('should render collapsed icon for collapsed question', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const icon = locators.questionIconCollapsed();
        expect(icon).toBeInTheDocument();
      });

      it('should render expanded icon for expanded question', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question2]},
        });
        const icon = locators.questionIconExpanded();
        expect(icon).toBeInTheDocument();
      });

      describe('when question is expanded', () => {
        it('should render answer', async () => {
          const {locators} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const answer = locators.smartSnippetAnswer();
          expect(answer).toBeInTheDocument();
        });

        it('should render answer with correct html content', async () => {
          const {locators} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const answer = locators.smartSnippetAnswer();
          expect(answer?.getAttribute('exportparts')).toBe('answer');
        });

        it('should render source when available', async () => {
          const {locators} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const source = locators.smartSnippetSource();
          expect(source).toBeInTheDocument();
        });

        it('should render footer part', async () => {
          const {locators} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const footer = locators.footer();
          expect(footer).toBeInTheDocument();
        });

        it('should have links to the source', async () => {
          const questionWithSource = buildFakeRelatedQuestion({
            questionAnswerId: 'q-source',
            expanded: true,
            source: {
              title: 'Doc title',
              uri: 'https://example.com/doc',
              clickUri: 'https://example.com/doc',
              uniqueId: 'doc-1',
              raw: {},
            } as unknown as Result,
          });

          const {locators} = await renderComponent({
            controllerState: {questions: [questionWithSource]},
          });

          const sourceEl = locators.smartSnippetSource() as
            | (HTMLElement & {source?: unknown; anchorAttributes?: unknown})
            | null;

          expect(sourceEl).toBeInTheDocument();
          expect(sourceEl?.source).toEqual(questionWithSource.source);
          expect(sourceEl?.anchorAttributes).toBeUndefined();
        });
      });

      it('should not render answer when question is collapsed', async () => {
        const {locators} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const answer = locators.smartSnippetAnswer();
        expect(answer).toBeNull();
      });
    });
  });

  describe('interactions', () => {
    let question: SmartSnippetRelatedQuestion;

    beforeEach(() => {
      question = buildFakeRelatedQuestion({
        questionAnswerId: 'q1',
        question: 'Test question?',
        answer: 'Test answer',
        expanded: false,
      });
    });

    it('should call expand when clicking collapsed question', async () => {
      const expand = vi.fn();
      const {locators} = await renderComponent({
        controllerImplementation: {expand},
        controllerState: {questions: [question]},
      });

      const button = locators.questionButtonCollapsed() as HTMLElement;
      await button.click();

      expect(expand).toHaveBeenCalledWith('q1');
    });

    it('should call collapse when clicking expanded question', async () => {
      const collapse = vi.fn();
      const expandedQuestion = {...question, expanded: true};
      const {locators} = await renderComponent({
        controllerImplementation: {collapse},
        controllerState: {questions: [expandedQuestion]},
      });

      const button = locators.questionButtonExpanded() as HTMLElement;
      await button.click();

      expect(collapse).toHaveBeenCalledWith('q1');
    });

    it('should fallback to a div for the accessibility heading when heading-level is 0', async () => {
      const question = buildFakeRelatedQuestion({questionAnswerId: 'q1'});
      const {locators} = await renderComponent({
        props: {headingLevel: 0},
        controllerState: {questions: [question]},
      });
      const heading = locators.heading();
      expect(heading?.tagName).toBe('DIV');
    });

    it('should fallback to a div for questions when heading-level is 0', async () => {
      const question = buildFakeRelatedQuestion({questionAnswerId: 'q1'});
      const {locators} = await renderComponent({
        props: {headingLevel: 0},
        controllerState: {questions: [question]},
      });
      const questionText = locators.questionTextCollapsed();
      expect(questionText?.tagName).toBe('DIV');
    });

    it('should use the correct heading level for the accessibility heading', async () => {
      const headingLevel = 5;
      const question = buildFakeRelatedQuestion({questionAnswerId: 'q1'});
      const {locators} = await renderComponent({
        props: {headingLevel},
        controllerState: {questions: [question]},
      });
      const heading = locators.heading();
      expect(heading?.tagName).toBe(`H${headingLevel}`);
    });

    it('should use the correct heading level for the question', async () => {
      const headingLevel = 5;
      const question = buildFakeRelatedQuestion({questionAnswerId: 'q1'});
      const {locators} = await renderComponent({
        props: {headingLevel},
        controllerState: {questions: [question]},
      });
      const questionText = locators.questionTextCollapsed();
      expect(questionText?.tagName).toBe(`H${headingLevel + 1}`);
    });

    it('should render the correct expanded/collapsed parts for mixed state', async () => {
      const questions = [
        buildFakeRelatedQuestion({questionAnswerId: 'q1', expanded: false}),
        buildFakeRelatedQuestion({questionAnswerId: 'q2', expanded: true}),
        buildFakeRelatedQuestion({questionAnswerId: 'q3', expanded: true}),
      ];

      const {locators} = await renderComponent({
        controllerState: {questions},
      });

      expect(locators.questionAnswersExpanded().length).toBe(2);
      expect(locators.questionButtonsExpanded().length).toBe(2);
      expect(locators.questionIconsExpanded().length).toBe(2);
      expect(locators.questionTextsExpanded().length).toBe(2);
      expect(locators.answerAndSources().length).toBe(2);

      expect(locators.questionAnswersCollapsed().length).toBe(1);
      expect(locators.questionButtonsCollapsed().length).toBe(1);
      expect(locators.questionIconsCollapsed().length).toBe(1);
      expect(locators.questionTextsCollapsed().length).toBe(1);
    });

    it('should forward source selection events to the controller', async () => {
      const selectSource = vi.fn();
      const question = buildFakeRelatedQuestion({
        questionAnswerId: 'q1',
        expanded: true,
        source: {
          title: 'Doc title',
          uri: 'https://example.com/doc',
          clickUri: 'https://example.com/doc',
          uniqueId: 'doc-1',
          raw: {},
        } as unknown as Result,
      });

      const {locators} = await renderComponent({
        controllerImplementation: {selectSource},
        controllerState: {questions: [question]},
      });

      const sourceEl = locators.smartSnippetSource();
      sourceEl?.dispatchEvent(
        new CustomEvent('selectSource', {bubbles: true, composed: true})
      );

      expect(selectSource).toHaveBeenCalledWith('q1');
    });

    it('should forward inline link selection events to the controller', async () => {
      const selectInlineLink = vi.fn();
      const question = buildFakeRelatedQuestion({
        questionAnswerId: 'q1',
        expanded: true,
        answer:
          '<a href="https://example.com/a">Link A</a> <a href="https://example.com/b">Link B</a>',
      });

      const {locators} = await renderComponent({
        controllerImplementation: {selectInlineLink},
        controllerState: {questions: [question]},
      });

      const answerEl = locators.smartSnippetAnswer();
      answerEl?.dispatchEvent(
        new CustomEvent('selectInlineLink', {
          bubbles: true,
          composed: true,
          detail: {
            linkText: 'Link A',
            linkURL: 'https://example.com/a',
          },
        })
      );

      expect(selectInlineLink).toHaveBeenCalledTimes(1);
      expect(selectInlineLink).toHaveBeenCalledWith('q1', {
        linkText: 'Link A',
        linkURL: 'https://example.com/a',
      });
    });
  });

  it('should apply snippet style from prop', async () => {
    const customStyle = 'b { color: red; }';
    const question = buildFakeRelatedQuestion({
      expanded: true,
      answer: '<b>Test</b>',
    });

    const {locators} = await renderComponent({
      props: {snippetStyle: customStyle},
      controllerState: {questions: [question]},
    });

    const answer = locators.smartSnippetAnswer();
    const typedAnswer = answer as (HTMLElement & {innerStyle?: string}) | null;
    expect(typedAnswer).toBeInTheDocument();
    expect(typedAnswer?.innerStyle).toBe(customStyle);
  });

  it('should extract style from template slot', async () => {
    const question = buildFakeRelatedQuestion({
      expanded: true,
      answer: '<b>Test</b>',
    });
    const styleContent = 'b { color: blue; }';
    const slottedContent = `<template><style>${styleContent}</style></template>`;

    const {locators} = await renderComponent({
      slottedContent,
      controllerState: {questions: [question]},
    });

    const answer = locators.smartSnippetAnswer();
    expect(answer).toBeInTheDocument();

    const typedAnswer = answer as (HTMLElement & {innerStyle?: string}) | null;
    expect(typedAnswer?.innerStyle).toBe(styleContent);
  });

  it('should pass down slotted source anchor attributes (@slot source-anchor-attributes)', async () => {
    const questionWithSource = buildFakeRelatedQuestion({
      questionAnswerId: 'q-source',
      expanded: true,
      source: {
        title: 'Doc title',
        uri: 'https://example.com/doc',
        clickUri: 'https://example.com/doc',
        uniqueId: 'doc-1',
        raw: {},
      } as unknown as Result,
    });

    const slottedContent =
      '<a slot="source-anchor-attributes" target="_blank" rel="noopener" href="https://ignored.example.com"></a>';

    const {locators} = await renderComponent({
      slottedContent,
      controllerState: {questions: [questionWithSource]},
    });

    const sourceEl = locators.smartSnippetSource() as
      | (HTMLElement & {anchorAttributes?: Attr[]})
      | null;

    expect(sourceEl).toBeInTheDocument();
    expect(sourceEl?.anchorAttributes).toBeDefined();

    const attrs = sourceEl?.anchorAttributes!.reduce<Record<string, string>>(
      (acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      },
      {}
    );

    expect(attrs).toMatchObject({
      target: '_blank',
      rel: 'noopener',
    });
    expect(attrs.href).toBeUndefined();
    expect(attrs.slot).toBeUndefined();
  });

  it('should use default heading level of 0', async () => {
    const question = buildFakeRelatedQuestion();
    const {element} = await renderComponent({
      controllerState: {questions: [question]},
    });
    expect(element.headingLevel).toBe(0);
  });

  it('should use custom heading level', async () => {
    const question = buildFakeRelatedQuestion();
    const {element} = await renderComponent({
      props: {headingLevel: 3},
      controllerState: {questions: [question]},
    });
    expect(element.headingLevel).toBe(3);
  });
});
