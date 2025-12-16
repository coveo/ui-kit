import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {AtomicSmartSnippetCollapseWrapper} from './atomic-smart-snippet-collapse-wrapper';
import './atomic-smart-snippet-collapse-wrapper';
import '@/src/components/common/atomic-icon/atomic-icon';
import type {i18n} from 'i18next';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-smart-snippet-collapse-wrapper', () => {
  let i18n: i18n;
  const mockedEngine = buildFakeSearchEngine();

  beforeEach(async () => {
    i18n = await createTestI18n();
    console.error = vi.fn();
  });

  const renderComponent = async (
    options: {
      maximumHeight?: number;
      collapsedHeight?: number;
      slottedContent?: string;
    } = {}
  ) => {
    const {element} =
      await renderInAtomicSearchInterface<AtomicSmartSnippetCollapseWrapper>({
        template: html`<atomic-smart-snippet-collapse-wrapper
          .maximumHeight=${options.maximumHeight}
          .collapsedHeight=${options.collapsedHeight}
        >
          ${options.slottedContent ?? 'Default content'}
        </atomic-smart-snippet-collapse-wrapper>`,
        selector: 'atomic-smart-snippet-collapse-wrapper',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.i18n = i18n;
          return bindings;
        },
      });

    return {
      element,
      get wrapper() {
        return element.shadowRoot?.querySelector(
          '[part="smart-snippet-collapse-wrapper"]'
        )!;
      },
      showMoreButton() {
        return element.shadowRoot?.querySelector('[part="show-more-button"]')!;
      },
      showLessButton() {
        return element.shadowRoot?.querySelector('[part="show-less-button"]')!;
      },
    };
  };

  describe('#constructor', () => {
    it('should create an AtomicSmartSnippetCollapseWrapper instance', () => {
      const element = document.createElement(
        'atomic-smart-snippet-collapse-wrapper'
      );

      expect(element).toBeInstanceOf(AtomicSmartSnippetCollapseWrapper);
    });
  });

  describe('#render', () => {
    it('should render the wrapper part', async () => {
      const {wrapper} = await renderComponent();

      expect(wrapper).toBeInTheDocument();
    });

    it('should render slotted content', async () => {
      const {element} = await renderComponent({
        slottedContent: 'Test content for smart snippet',
      });

      expect(element.textContent).toContain('Test content for smart snippet');
    });

    describe('when maximumHeight is not set', () => {
      it('should not render the button', async () => {
        const {showMoreButton, showLessButton} = await renderComponent();

        expect(showMoreButton()).not.toBeInTheDocument();
        expect(showLessButton()).not.toBeInTheDocument();
      });

      it('should not have the invisible class', async () => {
        const {element} = await renderComponent();
        await element.updateComplete;

        expect(element).not.toHaveClass('invisible');
      });
    });

    describe('when maximumHeight is set and content is smaller', () => {
      it('should not render the button when content height is less than maximumHeight', async () => {
        const {wrapper} = await renderComponent({
          maximumHeight: 500,
          collapsedHeight: 200,
          slottedContent: 'Short content',
        });

        expect(wrapper).toBeInTheDocument();
      });
    });

    describe('when maximumHeight and collapsedHeight are set', () => {
      it('should render initially with invisible class until height is calculated', async () => {
        const mock = vi
          .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
          .mockReturnValue({
            height: 0,
          } as DOMRect);
        const {element} = await renderComponent({
          maximumHeight: 300,
          collapsedHeight: 100,
        });

        expect(element.className).toContain('invisible');
        mock.mockRestore();
      });
    });
  });

  describe('#initialize', () => {
    describe('when collapsedHeight is greater than maximumHeight', () => {
      it('should throw an error', async () => {
        const {element} = await renderComponent({
          maximumHeight: 100,
          collapsedHeight: 200,
        });

        expect(() => element.initialize()).toThrowError(
          'snippetMaximumHeight must be equal or greater than snippetCollapsedHeight'
        );
      });
    });

    describe('when maximumHeight is set but collapsedHeight is not', () => {
      it('should throw an error', async () => {
        const {element} = await renderComponent({
          maximumHeight: 300,
        });

        expect(() => element.initialize()).toThrowError(
          'snippetMaximumHeight must be equal or greater than snippetCollapsedHeight'
        );
      });
    });

    describe('when both heights are valid', () => {
      it('should not throw an error', async () => {
        const {element} = await renderComponent({
          maximumHeight: 300,
          collapsedHeight: 100,
        });

        expect(() => element.initialize()).not.toThrow();
      });
    });

    describe('when maximumHeight equals collapsedHeight', () => {
      it('should not throw an error', async () => {
        const {element} = await renderComponent({
          maximumHeight: 200,
          collapsedHeight: 200,
        });

        expect(() => element.initialize()).not.toThrow();
      });
    });
  });

  describe('#toggleExpanded (when button is clicked)', () => {
    it('should toggle the expanded state when show more button is clicked', async () => {
      const mock = vi
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue({
          height: 500,
        } as DOMRect);

      const {showMoreButton, showLessButton} = await renderComponent({
        maximumHeight: 300,
        collapsedHeight: 100,
      });

      expect(showMoreButton()).toBeTruthy();
      expect(showLessButton()).toBeNull();
      expect(showMoreButton()).toHaveTextContent('Show more');

      await userEvent.click(showMoreButton());

      expect(showMoreButton()).toBeNull();
      expect(showLessButton).toBeTruthy();
      expect(showLessButton()).toHaveTextContent('Show less');

      mock.mockRestore();
    });
  });

  it('should have the expanded class when content is fully visible', async () => {
    const {element} = await renderComponent();
    expect(element).toHaveClass('expanded');
  });
});
