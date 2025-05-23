import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, vi, it, expect} from 'vitest';
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
          setRef: vi.fn(),
          onShowMore: vi.fn(),
          isCollapsed: true,
          numberOfCollapsedBreadcrumbs: 2,
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
    expect(button).toHaveTextContent('Show 2 more filters');
  });

  it('should call onShowMore when clicked', async () => {
    const onShowMore = vi.fn();
    const {button} = await renderComponent({onShowMore});
    button?.click();
    expect(onShowMore).toHaveBeenCalled();
  });
});
