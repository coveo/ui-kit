import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderBreadcrumbShowLess} from './breadcrumb-show-less';

describe('#renderBreadcrumbShowLess', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderBreadcrumbShowLess({
        props: {
          i18n,
          onShowLess: vi.fn(),
          isCollapsed: false,
          ...overrides,
        },
      })}`
    );

    return {
      button: element.querySelector('button'),
    };
  };

  it('should have the "show-less" part', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('part', 'show-less');
  });

  it('should have the proper style class', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveClass('btn-outline-primary');
  });

  it('should have the correct text', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveTextContent('Show less');
  });

  it('should call onShowLess when clicked', async () => {
    const onShowLess = vi.fn();
    const {button} = await renderComponent({onShowLess});
    button?.click();
    expect(onShowLess).toHaveBeenCalled();
  });

  describe('when isCollapsed is true', () => {
    it('should not render the button', async () => {
      const {button} = await renderComponent({isCollapsed: true});
      expect(button).toBeNull();
    });
  });
});
