import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderBreadcrumbButton} from './breadcrumb-button';

describe('#renderBreadcrumbButton', () => {
  let i18n: i18n;
  let ariaController: AriaLiveRegionController;
  beforeAll(async () => {
    i18n = await createTestI18n();
    ariaController = vi.spyOn(
      AriaLiveRegionController.prototype,
      'message',
      'set'
    ) as unknown as AriaLiveRegionController;
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderBreadcrumbButton({
        props: {
          i18n,
          onSelectBreadcrumb: () => {},
          refCallback: () => {},
          pathLimit: 0,
          breadcrumb: {
            label: 'test',
            state: 'selected' as const,
            facetId: 'test-facet',
            formattedValue: ['test'],
            deselect: () => {},
          },
          ariaController: ariaController,
          ...overrides,
        },
      })(html`<span>Test</span>`)}`
    );

    return {
      button: element.querySelector('button'),
    };
  };

  it('should call the refCallback on the button', async () => {
    const refCallback = vi.fn();
    const {button} = await renderComponent({
      refCallback,
    });

    expect(refCallback).toHaveBeenCalledWith(button);
  });

  it('should have the "breadcrumb-button" part on the button', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('part', 'breadcrumb-button');
  });

  describe('when the breadcrumb is in an exclusion state', () => {
    let button: HTMLButtonElement;
    beforeEach(async () => {
      const {button: btn} = await renderComponent({
        breadcrumb: {
          label: 'test',
          state: 'excluded' as const,
          facetId: 'test-facet',
          formattedValue: ['test'],
          deselect: () => {},
        },
      });
      button = btn!;
    });

    it('should have the proper style on the button', async () => {
      expect(button).toHaveClass('btn-outline-error');
      expect(button).not.toHaveClass('btn-outline-bg-neutral');
    });

    it('should have the proper aria-label on the button', async () => {
      expect(button).toHaveAttribute(
        'aria-label',
        'Remove exclusion filter on test: test'
      );
    });
  });

  describe('when the breadcrumb is not in an exclusion state', () => {
    let button: HTMLButtonElement;

    beforeEach(async () => {
      const {button: btn} = await renderComponent({
        breadcrumb: {
          label: 'test',
          state: 'selected' as const,
          facetId: 'test-facet',
          formattedValue: ['test'],
          deselect: () => {},
        },
      });
      button = btn!;
    });

    it('should have the proper style on the button', async () => {
      expect(button).toHaveClass('btn-outline-bg-neutral');
      expect(button).not.toHaveClass('btn-outline-error');
    });

    it('should have the proper aria-label on the button', async () => {
      expect(button).toHaveAttribute(
        'aria-label',
        'Remove inclusion filter on test: test'
      );
    });
  });

  it('should have the proper title on the button', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('title', 'test: test');
  });

  it('should trigger the onSelectBreadcrumb callback when clicked', async () => {
    const onSelectBreadcrumb = vi.fn();
    const {button} = await renderComponent({
      onSelectBreadcrumb,
    });

    button?.click();

    expect(onSelectBreadcrumb).toHaveBeenCalled();
    expect(ariaController.message).toBe('Filter removed');
  });

  it('should render the children', async () => {
    const {button} = await renderComponent();
    expect(button?.innerHTML).toContain('Test');
  });
});
