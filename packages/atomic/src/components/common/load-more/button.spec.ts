import type {i18n as I18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderLoadMoreButton} from './button';

describe('#renderLoadMoreButton', () => {
  let i18n: I18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const onClick = vi.fn();
    const element = await renderFunctionFixture(
      html`${renderLoadMoreButton({
        props: {
          i18n,
          onClick,
          moreAvailable: true,
          label: 'load-more-results',
          ...overrides,
        },
      })}`
    );

    return {
      element,
      button: element.querySelector('button'),
      onClick,
    };
  };

  it('should render nothing when moreAvailable is false', async () => {
    const {button, element} = await renderComponent({moreAvailable: false});

    expect(button).toBeNull();
    expect(element.children).toHaveLength(0);
  });

  it('should render button with correct part attribute', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute('part', 'load-more-results-button');
  });

  it('should render correct label when label is load-more-results', async () => {
    const {button} = await renderComponent({label: 'load-more-results'});

    expect(button).toHaveTextContent('Load more results');
  });

  it('should render correct label when label is load-more-products', async () => {
    const {button} = await renderComponent({label: 'load-more-products'});

    expect(button).toHaveTextContent('Load more products');
  });

  it('should call onClick when button is clicked', async () => {
    const {button, onClick} = await renderComponent();

    button?.click();

    expect(onClick).toHaveBeenCalledOnce();
  });
});
