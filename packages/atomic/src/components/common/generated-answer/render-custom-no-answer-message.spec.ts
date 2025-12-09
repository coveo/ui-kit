import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderCustomNoAnswerMessageProps,
  renderCustomNoAnswerMessage,
} from './render-custom-no-answer-message';

describe('#renderCustomNoAnswerMessage', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderCustomNoAnswerMessageProps> = {}
  ) => {
    const defaultProps: RenderCustomNoAnswerMessageProps = {
      i18n,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderCustomNoAnswerMessage({props: defaultProps})}`
    );

    return {
      element,
      generatedContent: element.querySelector('[part="generated-content"]'),
      headerLabel: element.querySelector('[part="header-label"]'),
      generatedContainer: element.querySelector('[part="generated-container"]'),
      slot: element.querySelector('slot[name="no-answer-message"]'),
    };
  };

  it('should render the generated content container', async () => {
    const {generatedContent} = await renderComponent();

    expect(generatedContent).toBeInTheDocument();
  });

  it('should render the generated content with correct part attribute', async () => {
    const {generatedContent} = await renderComponent();

    expect(generatedContent).toHaveAttribute('part', 'generated-content');
  });

  it('should render the header label', async () => {
    const {headerLabel} = await renderComponent();

    expect(headerLabel).toBeInTheDocument();
  });

  it('should render the header label with correct part attribute', async () => {
    const {headerLabel} = await renderComponent();

    expect(headerLabel).toHaveAttribute('part', 'header-label');
  });

  it('should render the generated answer title', async () => {
    const {element} = await renderComponent();

    await expect.element(element).toHaveTextContent('Generated Answer');
  });

  it('should render the header label with correct classes', async () => {
    const {headerLabel} = await renderComponent();

    expect(headerLabel).toHaveClass('text-primary');
    expect(headerLabel).toHaveClass('bg-primary-background');
    expect(headerLabel).toHaveClass('inline-block');
    expect(headerLabel).toHaveClass('rounded-md');
    expect(headerLabel).toHaveClass('px-2.5');
    expect(headerLabel).toHaveClass('py-2');
    expect(headerLabel).toHaveClass('font-medium');
  });

  it('should render the generated container', async () => {
    const {generatedContainer} = await renderComponent();

    expect(generatedContainer).toBeInTheDocument();
  });

  it('should render the generated container with correct part attribute', async () => {
    const {generatedContainer} = await renderComponent();

    expect(generatedContainer).toHaveAttribute('part', 'generated-container');
  });

  it('should render the generated container with correct classes', async () => {
    const {generatedContainer} = await renderComponent();

    expect(generatedContainer).toHaveClass('mt-6');
    expect(generatedContainer).toHaveClass('break-words');
  });

  it('should render the no-answer-message slot', async () => {
    const {slot} = await renderComponent();

    expect(slot).toBeInTheDocument();
  });

  it('should render the slot with correct name attribute', async () => {
    const {slot} = await renderComponent();

    expect(slot).toHaveAttribute('name', 'no-answer-message');
  });

  it('should render with proper layout structure', async () => {
    const {generatedContent, generatedContainer} = await renderComponent();

    // Verify that the container is within the generated content
    expect(generatedContent).toContainElement(generatedContainer);
  });

  it('should have proper spacing with flex layout', async () => {
    const {element} = await renderComponent();
    const flexContainer = element.querySelector('.flex.items-center');

    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass('flex');
    expect(flexContainer).toHaveClass('items-center');
  });
});
