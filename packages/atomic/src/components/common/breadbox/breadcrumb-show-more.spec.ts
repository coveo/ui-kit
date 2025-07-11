import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderBreadcrumbShowMore} from './breadcrumb-show-more';

describe('#renderBreadcrumbShowLess', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderBreadcrumbShowMore({
        props: {
          i18n,
          refCallback: vi.fn(),
          onShowMore: vi.fn(),
          isCollapsed: true,
          numberOfCollapsedBreadcrumbs: 2,
          value: '+ 2',
          ariaLabel: 'Show more filters',
          ...overrides,
        },
      })}`
    );

    return {
      button: element.querySelector('button'),
    };
  };

  it('should have the "show-more" part', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('part', 'show-more');
  });

  it('should have the proper style class', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveClass('btn-outline-primary');
  });

  it('should have the correct text', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveTextContent('+ 2');
  });

  it('should call onShowMore when clicked', async () => {
    const onShowMore = vi.fn();
    const {button} = await renderComponent({onShowMore});
    button?.click();
    expect(onShowMore).toHaveBeenCalled();
  });

  describe('when isCollapsed is false', () => {
    it('should not render the button', async () => {
      const {button} = await renderComponent({isCollapsed: false});
      expect(button).toBeNull();
    });
  });

  it('should call the refCallback on the button', async () => {
    const refCallback = vi.fn();
    const {button} = await renderComponent({refCallback});
    expect(refCallback).toHaveBeenCalledWith(button);
  });

  it('should have the correct aria-label', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('aria-label', 'Show more filters');
  });
});
