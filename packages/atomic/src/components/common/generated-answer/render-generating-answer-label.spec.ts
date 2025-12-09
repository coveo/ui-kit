import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderGeneratingAnswerLabelProps,
  renderGeneratingAnswerLabel,
} from './render-generating-answer-label';

describe('#renderGeneratingAnswerLabel', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderGeneratingAnswerLabelProps> = {}
  ) => {
    const defaultProps: RenderGeneratingAnswerLabelProps = {
      i18n,
      isStreaming: false,
      collapsible: false,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderGeneratingAnswerLabel({props: defaultProps})}`
    );

    return {
      element,
      label: element.querySelector('[part="is-generating"]'),
    };
  };

  describe('when collapsible is true and isStreaming is true', () => {
    it('should render the generating answer label', async () => {
      const {label} = await renderComponent({
        collapsible: true,
        isStreaming: true,
      });

      expect(label).toBeInTheDocument();
    });

    it('should render the label with correct part attribute', async () => {
      const {label} = await renderComponent({
        collapsible: true,
        isStreaming: true,
      });

      expect(label).toHaveAttribute('part', 'is-generating');
    });

    it('should render the label with correct classes', async () => {
      const {label} = await renderComponent({
        collapsible: true,
        isStreaming: true,
      });

      expect(label).toHaveClass('text-primary');
      expect(label).toHaveClass('hidden');
      expect(label).toHaveClass('text-base');
      expect(label).toHaveClass('font-light');
    });

    it('should render the generating answer text with ellipsis', async () => {
      const {element} = await renderComponent({
        collapsible: true,
        isStreaming: true,
      });

      await expect.element(element).toHaveTextContent('Generating answer...');
    });
  });

  describe('when collapsible is false', () => {
    it('should not render anything', async () => {
      const {element} = await renderComponent({
        collapsible: false,
        isStreaming: true,
      });

      expect(element.children.length).toBe(0);
    });

    it('should not render the label', async () => {
      const {label} = await renderComponent({
        collapsible: false,
        isStreaming: true,
      });

      expect(label).not.toBeInTheDocument();
    });

    it('should not render the generating text', async () => {
      const {element} = await renderComponent({
        collapsible: false,
        isStreaming: true,
      });

      await expect.element(element).not.toHaveTextContent('Generating answer');
    });
  });

  describe('when isStreaming is false', () => {
    it('should not render anything', async () => {
      const {element} = await renderComponent({
        collapsible: true,
        isStreaming: false,
      });

      expect(element.children.length).toBe(0);
    });

    it('should not render the label', async () => {
      const {label} = await renderComponent({
        collapsible: true,
        isStreaming: false,
      });

      expect(label).not.toBeInTheDocument();
    });

    it('should not render the generating text', async () => {
      const {element} = await renderComponent({
        collapsible: true,
        isStreaming: false,
      });

      await expect.element(element).not.toHaveTextContent('Generating answer');
    });
  });

  describe('when both collapsible and isStreaming are false', () => {
    it('should not render anything', async () => {
      const {element} = await renderComponent({
        collapsible: false,
        isStreaming: false,
      });

      expect(element.children.length).toBe(0);
    });

    it('should not render the label', async () => {
      const {label} = await renderComponent({
        collapsible: false,
        isStreaming: false,
      });

      expect(label).not.toBeInTheDocument();
    });
  });
});
