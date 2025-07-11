import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderBreadcrumbClearAll} from './breadcrumb-clear-all';

describe('#renderBreadcrumbClearAll', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderBreadcrumbClearAll({
        props: {
          refCallback: () => {},
          onClick: () => {},
          isCollapsed: false,
          i18n,
          ...overrides,
        },
      })}`
    );

    return {
      button: element.querySelector('button'),
    };
  };

  it('should call the refCallback', async () => {
    const refCallback = vi.fn();
    const {button} = await renderComponent({
      refCallback,
    });

    expect(refCallback).toHaveBeenCalledWith(button);
  });

  it('should have the "clear" part', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('part', 'clear');
  });

  it('should have the proper class', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveClass('btn-text-primary');
  });

  it('should have the proper text', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveTextContent('Clear');
  });

  it('should have the proper aria-label', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('aria-label', 'Clear All Filters');
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const {button} = await renderComponent({onClick});
    button?.click();
    expect(onClick).toHaveBeenCalled();
  });
});
