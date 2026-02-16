import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type QuestionProps, renderQuestion} from './question';

describe('#renderQuestion', () => {
  const renderComponent = async (
    props: Partial<QuestionProps> = {},
    children = html``
  ) => {
    const element = await renderFunctionFixture(
      html`${renderQuestion({
        props: {
          ariaControls: 'answer-1',
          expanded: false,
          onClick: vi.fn(),
          question: 'What is the answer?',
          ...props,
        },
      })(children)}`
    );

    return element.querySelector('button') as HTMLButtonElement;
  };

  it('should render a button', async () => {
    const button = await renderComponent();
    expect(button).toBeInTheDocument();
  });

  it('should render with collapsed button part when not expanded', async () => {
    const button = await renderComponent({expanded: false});
    expect(button.getAttribute('part')).toBe('question-button-collapsed');
  });

  it('should render with expanded button part when expanded', async () => {
    const button = await renderComponent({expanded: true});
    expect(button.getAttribute('part')).toBe('question-button-expanded');
  });

  it('should render heading with question text', async () => {
    const button = await renderComponent({question: 'What is AI?'});
    const headingElement = button.querySelector('[part*="question-text"]');
    expect(headingElement?.textContent).toContain('What is AI?');
  });

  it('should render heading with correct level when headingLevel is provided', async () => {
    const button = await renderComponent({
      headingLevel: 2,
      question: 'Question?',
    });
    const heading = button.querySelector('h3');
    expect(heading).toBeInTheDocument();
  });

  it('should render heading with collapsed text part when not expanded', async () => {
    const button = await renderComponent({expanded: false});
    const headingElement = button.querySelector('[part*="question-text"]');
    expect(headingElement?.getAttribute('part')).toBe(
      'question-text-collapsed'
    );
  });

  it('should render heading with expanded text part when expanded', async () => {
    const button = await renderComponent({expanded: true});
    const headingElement = button.querySelector('[part*="question-text"]');
    expect(headingElement?.getAttribute('part')).toBe('question-text-expanded');
  });

  it('should have aria-expanded when expanded', async () => {
    const button = await renderComponent({expanded: true});
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('should have aria-expanded set to false when not expanded', async () => {
    const button = await renderComponent({expanded: false});
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should have aria-controls when expanded', async () => {
    const button = await renderComponent({
      expanded: true,
      ariaControls: 'custom-id',
    });
    expect(button.getAttribute('aria-controls')).toBe('custom-id');
  });

  it('should have aria-controls when not expanded', async () => {
    const button = await renderComponent({
      expanded: false,
      ariaControls: 'custom-id',
    });
    expect(button.getAttribute('aria-controls')).toBe('custom-id');
  });

  it('should render children before question text', async () => {
    const button = await renderComponent({}, html`<span class="icon">→</span>`);
    const icon = button.querySelector('.icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.textContent).toBe('→');
  });
});
