import {buildSmartSnippetQuestionsList as buildInsightSmartSnippetQuestionsList} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {
  buildFakeRelatedQuestion,
  buildFakeSmartSnippetQuestionsList,
} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/smart-snippet-questions-list-controller';
import type {AtomicInsightSmartSnippetSuggestions} from './atomic-insight-smart-snippet-suggestions';
import './atomic-insight-smart-snippet-suggestions';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-smart-snippet-suggestions', () => {
  const mockEngine = buildFakeInsightEngine();
  let mockController: ReturnType<typeof buildFakeSmartSnippetQuestionsList>;

  const renderComponent = async ({
    props = {},
    slottedContent,
    controllerState = {},
  }: {
    props?: Partial<{
      headingLevel: number;
      snippetStyle: string;
    }>;
    slottedContent?: string;
    controllerState?: Parameters<
      typeof buildFakeSmartSnippetQuestionsList
    >[0]['state'];
  } = {}) => {
    mockController = buildFakeSmartSnippetQuestionsList({
      state: controllerState,
    });
    vi.mocked(buildInsightSmartSnippetQuestionsList).mockReturnValue(
      mockController
    );

    const template = slottedContent
      ? html`<atomic-insight-smart-snippet-suggestions
          heading-level=${props.headingLevel ?? 0}
          snippet-style=${props.snippetStyle ?? ''}
        >
          ${html([slottedContent] as unknown as TemplateStringsArray)}
        </atomic-insight-smart-snippet-suggestions>`
      : html`<atomic-insight-smart-snippet-suggestions
          heading-level=${props.headingLevel ?? 0}
          snippet-style=${props.snippetStyle ?? ''}
        ></atomic-insight-smart-snippet-suggestions>`;

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightSmartSnippetSuggestions>(
        {
          template,
          selector: 'atomic-insight-smart-snippet-suggestions',
          bindings: (bindings) => {
            bindings.engine = mockEngine;
            return bindings;
          },
        }
      );

    return {
      element,
      parts: (el: AtomicInsightSmartSnippetSuggestions) => ({
        container: el.shadowRoot?.querySelector('[part="container"]'),
        heading: el.shadowRoot?.querySelector('[part="heading"]'),
        questions: el.shadowRoot?.querySelector('[part="questions"]'),
      }),
    };
  };

  describe('#initialize', () => {
    it('should build controller with engine', async () => {
      const {element} = await renderComponent();
      expect(buildInsightSmartSnippetQuestionsList).toHaveBeenCalledWith(
        mockEngine
      );
      expect(element.smartSnippetQuestionsList).toBe(mockController);
    });

    it('should not set error with valid props', async () => {
      const {element} = await renderComponent({
        props: {headingLevel: 2},
      });
      expect(element.error).toBeUndefined();
    });
  });

  describe('rendering', () => {
    describe('when no questions are available', () => {
      it('should not render anything', async () => {
        const {element, parts} = await renderComponent({
          controllerState: {questions: []},
        });
        expect(parts(element).container).not.toBeInTheDocument();
      });
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
        const {element, parts} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        await expect.element(parts(element).container).toBeInTheDocument();
        await expect.element(parts(element).heading).toBeInTheDocument();
        await expect.element(parts(element).questions).toBeInTheDocument();
      });

      it('should render heading with correct text', async () => {
        const {parts, element} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        await expect
          .element(parts(element).heading)
          .toHaveTextContent('People also ask');
      });

      it('should render all questions', async () => {
        const {element} = await renderComponent({
          controllerState: {questions: [question1, question2]},
        });
        const questionElements = element.shadowRoot?.querySelectorAll(
          '[part^="question-answer"]'
        );
        expect(questionElements?.length).toBe(2);
      });

      it('should render question with collapsed state', async () => {
        const {element} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const collapsedQuestion = element.shadowRoot?.querySelector(
          '[part="question-answer-collapsed"]'
        );
        await expect.element(collapsedQuestion).toBeInTheDocument();
      });

      it('should render question with expanded state', async () => {
        const {element} = await renderComponent({
          controllerState: {questions: [question2]},
        });
        const expandedQuestion = element.shadowRoot?.querySelector(
          '[part="question-answer-expanded"]'
        );
        await expect.element(expandedQuestion).toBeInTheDocument();
      });

      it('should render question button with correct text', async () => {
        const {element} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const button = element.shadowRoot?.querySelector(
          '[part="question-button-collapsed"]'
        );
        await expect.element(button).toHaveTextContent('What is Coveo?');
      });

      it('should render collapsed icon for collapsed question', async () => {
        const {element} = await renderComponent({
          controllerState: {questions: [question1]},
        });
        const icon = element.shadowRoot?.querySelector(
          '[part="question-icon-collapsed"]'
        );
        await expect.element(icon).toBeInTheDocument();
      });

      it('should render expanded icon for expanded question', async () => {
        const {element} = await renderComponent({
          controllerState: {questions: [question2]},
        });
        const icon = element.shadowRoot?.querySelector(
          '[part="question-icon-expanded"]'
        );
        await expect.element(icon).toBeInTheDocument();
      });

      describe('when question is expanded', () => {
        it('should render answer', async () => {
          const {element} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const answer = element.shadowRoot?.querySelector(
            'atomic-smart-snippet-answer'
          );
          await expect.element(answer).toBeInTheDocument();
        });

        it('should render answer with correct html content', async () => {
          const {element} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const answer = element.shadowRoot?.querySelector(
            'atomic-smart-snippet-answer'
          );
          expect(answer?.getAttribute('exportparts')).toBe('answer');
        });

        it('should render source when available', async () => {
          const {element} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const source = element.shadowRoot?.querySelector(
            'atomic-smart-snippet-source'
          );
          await expect.element(source).toBeInTheDocument();
        });

        it('should render footer part', async () => {
          const {element} = await renderComponent({
            controllerState: {questions: [question2]},
          });
          const footer = element.shadowRoot?.querySelector('[part="footer"]');
          await expect.element(footer).toBeInTheDocument();
        });
      });

      describe('when question is collapsed', () => {
        it('should not render answer', async () => {
          const {element} = await renderComponent({
            controllerState: {questions: [question1]},
          });
          const answer = element.shadowRoot?.querySelector(
            'atomic-smart-snippet-answer'
          );
          expect(answer).toBeNull();
        });
      });
    });
  });

  describe('interactions', () => {
    const question = buildFakeRelatedQuestion({
      questionAnswerId: 'q1',
      question: 'Test question?',
      answer: 'Test answer',
      expanded: false,
    });

    it('should call expand when clicking collapsed question', async () => {
      const expand = vi.fn();
      mockController.expand = expand;

      const {element} = await renderComponent({
        controllerState: {questions: [question]},
      });

      const button = element.shadowRoot?.querySelector(
        '[part="question-button-collapsed"]'
      ) as HTMLElement;
      await button.click();

      expect(expand).toHaveBeenCalledWith('q1');
    });

    it('should call collapse when clicking expanded question', async () => {
      const collapse = vi.fn();
      mockController.collapse = collapse;

      const expandedQuestion = {...question, expanded: true};
      const {element} = await renderComponent({
        controllerState: {questions: [expandedQuestion]},
      });

      const button = element.shadowRoot?.querySelector(
        '[part="question-button-expanded"]'
      ) as HTMLElement;
      await button.click();

      expect(collapse).toHaveBeenCalledWith('q1');
    });
  });

  describe('custom styling', () => {
    it('should apply snippet style from prop', async () => {
      const customStyle = 'b { color: red; }';
      const question = buildFakeRelatedQuestion({expanded: true});

      const {element} = await renderComponent({
        props: {snippetStyle: customStyle},
        controllerState: {questions: [question]},
      });

      const answer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-answer'
      );
      expect(answer).toBeInTheDocument();
    });

    it('should extract style from template slot', async () => {
      const question = buildFakeRelatedQuestion({expanded: true});
      const styleContent = 'b { color: blue; }';
      const slottedContent = `<template><style>${styleContent}</style></template>`;

      const {element} = await renderComponent({
        slottedContent,
        controllerState: {questions: [question]},
      });

      const answer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-answer'
      );
      expect(answer).toBeInTheDocument();
    });
  });

  describe('heading level', () => {
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
});
