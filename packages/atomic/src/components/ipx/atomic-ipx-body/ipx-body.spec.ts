import {html, nothing} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderIpxBody} from './ipx-body.js';

describe('#renderIpxBody', () => {
  const parts = (element: HTMLElement) => {
    const qs = (part: string) => element.querySelector(`[part="${part}"]`);
    return {
      container: qs('container'),
      headerWrapper: qs('header-wrapper'),
      header: qs('header'),
      headerRuler: qs('header-ruler'),
      bodyWrapper: qs('body-wrapper'),
      body: qs('body'),
      footerWrapper: qs('footer-wrapper'),
      footer: qs('footer'),
    };
  };

  const renderComponent = async (overrides = {}) => {
    const headerContent = html`<h1>Header Content</h1>`;
    const bodyContent = html`<p>Body Content</p>`;
    const footerContent = html`<button>Footer Button</button>`;

    const element = await renderFunctionFixture(
      html`${renderIpxBody({
        props: {
          visibility: 'open',
          displayFooterSlot: true,
          header: headerContent,
          body: bodyContent,
          footer: footerContent,
          ...overrides,
        },
      })}`
    );

    return {
      element,
      parts: parts(element),
    };
  };

  it('should render all required parts', async () => {
    const {parts: allParts} = await renderComponent();

    expect(allParts.container).toBeInTheDocument();
    expect(allParts.headerWrapper).toBeInTheDocument();
    expect(allParts.header).toBeInTheDocument();
    expect(allParts.headerRuler).toBeInTheDocument();
    expect(allParts.bodyWrapper).toBeInTheDocument();
    expect(allParts.body).toBeInTheDocument();
    expect(allParts.footerWrapper).toBeInTheDocument();
    expect(allParts.footer).toBeInTheDocument();
  });

  it('should render header content', async () => {
    const {parts: allParts} = await renderComponent();

    expect(allParts.header).toHaveTextContent('Header Content');
  });

  it('should render body content', async () => {
    const {parts: allParts} = await renderComponent();

    expect(allParts.body).toHaveTextContent('Body Content');
  });

  it('should render footer content', async () => {
    const {parts: allParts} = await renderComponent();

    expect(allParts.footer).toHaveTextContent('Footer Button');
  });

  it('should apply visible class when visibility is open', async () => {
    const {parts: allParts} = await renderComponent({visibility: 'open'});
    const container = allParts.container as HTMLElement;

    expect(container.classList.contains('visible')).toBe(true);
  });

  it('should apply invisible class when visibility is closed', async () => {
    const {parts: allParts} = await renderComponent({visibility: 'closed'});
    const container = allParts.container as HTMLElement;

    expect(container.classList.contains('invisible')).toBe(true);
  });

  it('should not apply visibility class when visibility is embedded', async () => {
    const {parts: allParts} = await renderComponent({visibility: 'embedded'});
    const container = allParts.container as HTMLElement;

    expect(container.classList.contains('visible')).toBe(false);
    expect(container.classList.contains('invisible')).toBe(false);
  });

  it('should apply invisible class when visibility is undefined', async () => {
    const {parts: allParts} = await renderComponent({visibility: undefined});
    const container = allParts.container as HTMLElement;

    expect(container.classList.contains('invisible')).toBe(true);
  });

  it('should not render footer parts when footer is disabled', async () => {
    const {parts: allParts} = await renderComponent({
      displayFooterSlot: false,
    });

    expect(allParts.footerWrapper).not.toBeInTheDocument();
    expect(allParts.footer).not.toBeInTheDocument();
  });

  describe('when onAnimationEnd callback is provided', () => {
    it('should call callback when animationend event fires', async () => {
      const onAnimationEnd = vi.fn();
      const {parts: allParts} = await renderComponent({onAnimationEnd});
      const container = allParts.container as HTMLElement;

      container.dispatchEvent(new AnimationEvent('animationend'));

      expect(onAnimationEnd).toHaveBeenCalledOnce();
    });

    it('should call callback multiple times for multiple animations', async () => {
      const onAnimationEnd = vi.fn();
      const {parts: allParts} = await renderComponent({onAnimationEnd});
      const container = allParts.container as HTMLElement;

      container.dispatchEvent(new AnimationEvent('animationend'));
      container.dispatchEvent(new AnimationEvent('animationend'));

      expect(onAnimationEnd).toHaveBeenCalledTimes(2);
    });
  });

  it('should not throw when animationend event fires without callback', async () => {
    const {parts: allParts} = await renderComponent({
      onAnimationEnd: undefined,
    });
    const container = allParts.container as HTMLElement;

    expect(() => {
      container.dispatchEvent(new AnimationEvent('animationend'));
    }).not.toThrow();
  });

  it('should render empty header part when header content is nothing', async () => {
    const {parts: allParts} = await renderComponent({header: nothing});

    expect(allParts.header).toBeInTheDocument();
    expect(allParts.header?.textContent?.trim()).toBe('');
  });

  it('should render empty body part when body content is nothing', async () => {
    const {parts: allParts} = await renderComponent({body: nothing});

    expect(allParts.body).toBeInTheDocument();
    expect(allParts.body?.textContent?.trim()).toBe('');
  });

  it('should render empty footer part when footer content is nothing', async () => {
    const {parts: allParts} = await renderComponent({footer: nothing});

    expect(allParts.footer).toBeInTheDocument();
    expect(allParts.footer?.textContent?.trim()).toBe('');
  });
});
