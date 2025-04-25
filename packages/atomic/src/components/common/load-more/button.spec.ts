import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {i18n as I18n} from 'i18next';
import {html, render} from 'lit';
import {loadMoreButton} from './button';

describe('loadMoreButton', () => {
  let container: HTMLElement;
  let i18n: I18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderLoadMoreButton = (props: {
    moreAvailable: boolean;
    label?: 'load-more-results' | 'load-more-products';
  }) => {
    render(
      html`${loadMoreButton({
        props: {
          i18n,
          onClick: () => {},
          moreAvailable: props.moreAvailable,
          label: props.label ?? 'load-more-results',
        },
      })}`,
      container
    );
  };

  test('should render nothing when moreAvailable is false', () => {
    renderLoadMoreButton({moreAvailable: false});

    expect(container).toBeEmptyDOMElement();
  });

  test('should render a button with the correct props', () => {
    renderLoadMoreButton({moreAvailable: true});

    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-primary');
    expect(button).toHaveClass('my-2');
    expect(button).toHaveClass('p-3');
    expect(button).toHaveClass('font-bold');
  });

  test('should render the children as the label', () => {
    renderLoadMoreButton({moreAvailable: true, label: 'load-more-products'});

    const button = container.querySelector('button');
    expect(button).toHaveTextContent('Load more products');
  });
});
