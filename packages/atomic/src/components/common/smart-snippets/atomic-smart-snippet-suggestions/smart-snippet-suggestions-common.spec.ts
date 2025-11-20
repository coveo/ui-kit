import type {i18n} from 'i18next';
import {html, render} from 'lit';
import {within} from 'storybook/test';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getQuestionPart,
  renderSmartSnippetSuggestionsAnswerAndSourceWrapper,
  renderSmartSnippetSuggestionsFooter,
  renderSmartSnippetSuggestionsQuestion,
  renderSmartSnippetSuggestionsQuestionWrapper,
  renderSmartSnippetSuggestionsWrapper,
  type SmartSnippetSuggestionsAnswerAndSourceWrapperProps,
  type SmartSnippetSuggestionsFooterProps,
  type SmartSnippetSuggestionsQuestionProps,
  type SmartSnippetSuggestionsQuestionWrapperProps,
  type SmartSnippetSuggestionsWrapperProps,
} from './smart-snippet-suggestions-common';

describe('#renderSmartSnippetSuggestionsWrapper', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderWrapper = (
    props: Partial<SmartSnippetSuggestionsWrapperProps> = {},
    children = html`<li>Question</li>`
  ) => {
    const defaultProps: SmartSnippetSuggestionsWrapperProps = {
      headingLevel: 2,
      i18n,
    };

    render(
      html`${renderSmartSnippetSuggestionsWrapper({
        props: {...defaultProps, ...props},
      })(children)}`,
      container
    );

    return within(container).getByRole('complementary');
  };

  it('should render an aside element with role complementary', () => {
    const wrapper = renderWrapper();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName.toLowerCase()).toBe('aside');
  });

  it('should render with container part', () => {
    const wrapper = renderWrapper();
    expect(wrapper.getAttribute('part')).toBe('container');
  });

  it('should render heading with correct level', () => {
    const wrapper = renderWrapper({headingLevel: 3});
    const heading = within(wrapper).getByRole('heading');
    expect(heading.tagName.toLowerCase()).toBe('h3');
  });

  it('should render heading with correct part', () => {
    const wrapper = renderWrapper();
    const heading = within(wrapper).getByRole('heading');
    expect(heading.getAttribute('part')).toBe('heading');
  });

  it('should render ul element with questions part', () => {
    const wrapper = renderWrapper();
    const list = wrapper.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list?.getAttribute('part')).toBe('questions');
  });

  it('should render children inside the ul', () => {
    const wrapper = renderWrapper({}, html`<li>Custom Question</li>`);
    const list = wrapper.querySelector('ul');
    expect(list?.textContent).toContain('Custom Question');
  });

  it('should have correct aria-label', () => {
    const wrapper = renderWrapper();
    expect(wrapper.getAttribute('aria-label')).toBe(
      i18n.t('smart-snippet-people-also-ask')
    );
  });
});

describe('#renderSmartSnippetSuggestionsQuestionWrapper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderQuestionWrapper = (
    props: Partial<SmartSnippetSuggestionsQuestionWrapperProps> = {},
    children = html`<div>Question Content</div>`
  ) => {
    const defaultProps: SmartSnippetSuggestionsQuestionWrapperProps = {
      expanded: false,
      key: 'question-1',
    };

    render(
      html`${renderSmartSnippetSuggestionsQuestionWrapper({
        props: {...defaultProps, ...props},
      })(children)}`,
      container
    );

    return container.querySelector('li') as HTMLElement;
  };

  it('should render an li element', () => {
    const wrapper = renderQuestionWrapper();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName.toLowerCase()).toBe('li');
  });

  it('should render with collapsed part when not expanded', () => {
    const wrapper = renderQuestionWrapper({expanded: false});
    expect(wrapper.getAttribute('part')).toBe('question-answer-collapsed');
  });

  it('should render with expanded part when expanded', () => {
    const wrapper = renderQuestionWrapper({expanded: true});
    expect(wrapper.getAttribute('part')).toBe('question-answer-expanded');
  });

  it('should render with key attribute', () => {
    const wrapper = renderQuestionWrapper({key: 'custom-key'});
    expect(wrapper.getAttribute('key')).toBe('custom-key');
  });

  it('should render children inside article', () => {
    const wrapper = renderQuestionWrapper({}, html`<div>Custom Content</div>`);
    const article = wrapper.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article?.textContent).toContain('Custom Content');
  });
});

describe('#renderSmartSnippetSuggestionsQuestion', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderQuestion = (
    props: Partial<SmartSnippetSuggestionsQuestionProps> = {},
    children = html``
  ) => {
    const defaultProps: SmartSnippetSuggestionsQuestionProps = {
      ariaControls: 'answer-1',
      expanded: false,
      onClick: vi.fn(),
      question: 'What is the answer?',
    };

    render(
      html`${renderSmartSnippetSuggestionsQuestion({
        props: {...defaultProps, ...props},
      })(children)}`,
      container
    );

    return within(container).getByRole('button');
  };

  it('should render a button', () => {
    const button = renderQuestion();
    expect(button).toBeInTheDocument();
  });

  it('should render with collapsed button part when not expanded', () => {
    const button = renderQuestion({expanded: false});
    expect(button.getAttribute('part')).toBe('question-button-collapsed');
  });

  it('should render with expanded button part when expanded', () => {
    const button = renderQuestion({expanded: true});
    expect(button.getAttribute('part')).toBe('question-button-expanded');
  });

  it('should render heading with question text', () => {
    const button = renderQuestion({question: 'What is AI?'});
    // When headingLevel is 0, it renders a div, not a heading
    const headingElement = button.querySelector('[part*="question-text"]');
    expect(headingElement?.textContent).toContain('What is AI?');
  });

  it('should render heading with correct level when headingLevel is provided', () => {
    const button = renderQuestion({headingLevel: 2, question: 'Question?'});
    const heading = within(button).getByRole('heading');
    expect(heading.tagName.toLowerCase()).toBe('h3'); // headingLevel + 1
  });

  it('should render heading with collapsed text part when not expanded', () => {
    const button = renderQuestion({expanded: false});
    const headingElement = button.querySelector('[part*="question-text"]');
    expect(headingElement?.getAttribute('part')).toBe(
      'question-text-collapsed'
    );
  });

  it('should render heading with expanded text part when expanded', () => {
    const button = renderQuestion({expanded: true});
    const headingElement = button.querySelector('[part*="question-text"]');
    expect(headingElement?.getAttribute('part')).toBe('question-text-expanded');
  });

  it('should have aria-expanded when expanded', () => {
    const button = renderQuestion({expanded: true});
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('should not have aria-expanded when not expanded', () => {
    const button = renderQuestion({expanded: false});
    expect(button.getAttribute('aria-expanded')).toBeNull();
  });

  it('should have aria-controls when expanded', () => {
    const button = renderQuestion({
      expanded: true,
      ariaControls: 'custom-id',
    });
    expect(button.getAttribute('aria-controls')).toBe('custom-id');
  });

  it('should not have aria-controls when not expanded', () => {
    const button = renderQuestion({expanded: false, ariaControls: 'custom-id'});
    expect(button.getAttribute('aria-controls')).toBeNull();
  });

  it('should render children before question text', () => {
    const button = renderQuestion({}, html`<span class="icon">→</span>`);
    const icon = button.querySelector('.icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.textContent).toBe('→');
  });
});

describe('#renderSmartSnippetSuggestionsAnswerAndSourceWrapper', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderAnswerWrapper = (
    props: Partial<SmartSnippetSuggestionsAnswerAndSourceWrapperProps> = {},
    children = html`<div>Answer Content</div>`
  ) => {
    const defaultProps: SmartSnippetSuggestionsAnswerAndSourceWrapperProps = {
      expanded: false,
      id: 'answer-1',
    };

    render(
      html`${renderSmartSnippetSuggestionsAnswerAndSourceWrapper({
        props: {...defaultProps, ...props},
      })(children)}`,
      container
    );

    return container.querySelector('div') as HTMLElement;
  };

  it('should render a div element', () => {
    const wrapper = renderAnswerWrapper();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName.toLowerCase()).toBe('div');
  });

  it('should render with answer-and-source part', () => {
    const wrapper = renderAnswerWrapper();
    expect(wrapper.getAttribute('part')).toBe('answer-and-source');
  });

  it('should render with correct id', () => {
    const wrapper = renderAnswerWrapper({id: 'custom-id'});
    expect(wrapper.getAttribute('id')).toBe('custom-id');
  });

  it('should render children', () => {
    const wrapper = renderAnswerWrapper({}, html`<p>Custom Answer</p>`);
    expect(wrapper.textContent).toContain('Custom Answer');
  });
});

describe('#renderSmartSnippetSuggestionsFooter', () => {
  let container: HTMLElement;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderFooter = (
    props: Partial<SmartSnippetSuggestionsFooterProps> = {},
    children = html`<a href="#">Source</a>`
  ) => {
    const defaultProps: SmartSnippetSuggestionsFooterProps = {
      i18n,
    };

    render(
      html`${renderSmartSnippetSuggestionsFooter({
        props: {...defaultProps, ...props},
      })(children)}`,
      container
    );

    return container.querySelector('footer') as HTMLElement;
  };

  it('should render a footer element', () => {
    const footer = renderFooter();
    expect(footer).toBeInTheDocument();
    expect(footer.tagName.toLowerCase()).toBe('footer');
  });

  it('should render with footer part', () => {
    const footer = renderFooter();
    expect(footer.getAttribute('part')).toBe('footer');
  });

  it('should have correct aria-label', () => {
    const footer = renderFooter();
    expect(footer.getAttribute('aria-label')).toBe(
      i18n.t('smart-snippet-source')
    );
  });

  it('should render children', () => {
    const footer = renderFooter({}, html`<a href="#">Custom Source</a>`);
    expect(footer.textContent).toContain('Custom Source');
  });
});

describe('#getQuestionPart', () => {
  it('should return collapsed part when expanded is false', () => {
    expect(getQuestionPart('button', false)).toBe('question-button-collapsed');
    expect(getQuestionPart('text', false)).toBe('question-text-collapsed');
    expect(getQuestionPart('icon', false)).toBe('question-icon-collapsed');
  });

  it('should return expanded part when expanded is true', () => {
    expect(getQuestionPart('button', true)).toBe('question-button-expanded');
    expect(getQuestionPart('text', true)).toBe('question-text-expanded');
    expect(getQuestionPart('icon', true)).toBe('question-icon-expanded');
  });

  it('should handle various base values', () => {
    expect(getQuestionPart('custom', false)).toBe('question-custom-collapsed');
    expect(getQuestionPart('another', true)).toBe('question-another-expanded');
  });
});
