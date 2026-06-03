import type {i18n} from 'i18next';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderRefineModal} from './modal';

describe('#renderRefineModal', () => {
  let i18n: i18n;
  let mockHost: HTMLElement;

  beforeAll(async () => {
    i18n = await createTestI18n();
    mockHost = document.createElement('div');
  });

  const renderComponent = async (overrides = {}) => {
    const children = html`<div class="test-children">Test Children</div>`;
    const element = await renderFunctionFixture(
      html`${renderRefineModal({
        props: {
          host: mockHost,
          i18n,
          i18nFooterButtonTextKey: 'view-products',
          onClose: () => {},
          title: 'Test Modal',
          numberOfItems: 42,
          isOpen: true,
          ...overrides,
        },
      })(children)}`
    );

    return {
      modal: element.querySelector('atomic-modal'),
      title: element.querySelector('h1[part="title"]'),
      closeButton: element.querySelector('button[part="close-button"]'),
      closeIcon: element.querySelector('atomic-icon[part="close-icon"]'),
      footerContent: element.querySelector('div[part="footer-content"]'),
      footerButton: element.querySelector('button[part="footer-button"]'),
      footerButtonText: element.querySelector(
        'span[part="footer-button-text"]'
      ),
      footerButtonCount: element.querySelector(
        'span[part="footer-button-count"]'
      ),
      children: element.querySelector('.test-children'),
    };
  };

  it('should render an atomic-modal element', async () => {
    const {modal} = await renderComponent();

    expect(modal?.tagName).toBe('ATOMIC-MODAL');
  });

  it('should render the title with correct part and text', async () => {
    const {title} = await renderComponent();

    expect(title).toHaveAttribute('part', 'title');
    expect(title).toHaveTextContent('Test Modal');
  });

  it('should render the close button with correct part', async () => {
    const {closeButton} = await renderComponent();

    expect(closeButton).toHaveAttribute('part', 'close-button');
  });

  it('should render the close icon with correct part and classes', async () => {
    const {closeIcon} = await renderComponent();

    expect(closeIcon).toHaveAttribute('part', 'close-icon');
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const {closeButton} = await renderComponent({onClose});

    await userEvent.click(closeButton!);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render footer content with correct part', async () => {
    const {footerContent} = await renderComponent();

    expect(footerContent).toHaveAttribute('part', 'footer-content');
    expect(footerContent).toHaveAttribute('slot', 'footer');
  });

  it('should render footer button with correct part', async () => {
    const {footerButton} = await renderComponent();

    expect(footerButton).toHaveAttribute('part', 'footer-button');
  });

  it('should render footer button text with correct part', async () => {
    const {footerButtonText} = await renderComponent();

    expect(footerButtonText).toHaveAttribute('part', 'footer-button-text');
    expect(footerButtonText).toHaveTextContent('View products');
  });

  it('should render footer button count with correct part', async () => {
    const {footerButtonCount} = await renderComponent();

    expect(footerButtonCount).toHaveAttribute('part', 'footer-button-count');
    expect(footerButtonCount).toHaveTextContent('(42)');
  });

  it('should call onClose when footer button is clicked', async () => {
    const onClose = vi.fn();
    const {footerButton} = await renderComponent({onClose});

    await userEvent.click(footerButton!);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render children content', async () => {
    const {children} = await renderComponent();

    expect(children).toHaveTextContent('Test Children');
  });

  it('should set modal properties & attributes correctly', async () => {
    const openButton = document.createElement('button');
    const {modal} = await renderComponent({
      isOpen: false,
      openButton,
      boundary: 'page',
    });

    expect(modal).toHaveProperty('fullscreen', true);
    expect(modal).toHaveProperty('isOpen', false);
    expect(modal).toHaveProperty('source', openButton);
    expect(modal).toHaveProperty('container', mockHost);
    expect(modal).toHaveProperty('boundary', 'page');
    expect(modal).toHaveAttribute(
      'exportparts',
      'backdrop,container,header-wrapper,header,header-ruler,body-wrapper,body,footer-wrapper,footer'
    );
    expect(modal).toHaveProperty('onAnimationEnded', expect.any(Function));
  });
});
