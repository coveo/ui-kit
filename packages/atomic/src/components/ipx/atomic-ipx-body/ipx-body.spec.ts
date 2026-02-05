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

  describe('when rendering all parts', () => {
    it('should render all 8 CSS parts correctly', async () => {
      const {parts: allParts} = await renderComponent();

      expect(allParts.container).toBeTruthy();
      expect(allParts.headerWrapper).toBeTruthy();
      expect(allParts.header).toBeTruthy();
      expect(allParts.headerRuler).toBeTruthy();
      expect(allParts.bodyWrapper).toBeTruthy();
      expect(allParts.body).toBeTruthy();
      expect(allParts.footerWrapper).toBeTruthy();
      expect(allParts.footer).toBeTruthy();
    });

    it('should render header content in the correct part', async () => {
      const {parts: allParts} = await renderComponent();

      expect(allParts.header).toHaveTextContent('Header Content');
    });

    it('should render body content in the correct part', async () => {
      const {parts: allParts} = await renderComponent();

      expect(allParts.body).toHaveTextContent('Body Content');
    });

    it('should render footer content in the correct part', async () => {
      const {parts: allParts} = await renderComponent();

      expect(allParts.footer).toHaveTextContent('Footer Button');
    });
  });

  describe('when visibility changes', () => {
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

    it('should not apply any visibility class when visibility is embedded', async () => {
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
  });

  describe('when footer slot is conditional', () => {
    it('should render footer parts when displayFooterSlot is true', async () => {
      const {parts: allParts} = await renderComponent({
        displayFooterSlot: true,
      });

      expect(allParts.footerWrapper).toBeTruthy();
      expect(allParts.footer).toBeTruthy();
    });

    it('should not render footer parts when displayFooterSlot is false', async () => {
      const {parts: allParts} = await renderComponent({
        displayFooterSlot: false,
      });

      expect(allParts.footerWrapper).toBeFalsy();
      expect(allParts.footer).toBeFalsy();
    });

    it('should render footer parts when displayFooterSlot is undefined', async () => {
      const {parts: allParts} = await renderComponent({
        displayFooterSlot: undefined,
      });

      expect(allParts.footerWrapper).toBeTruthy();
      expect(allParts.footer).toBeTruthy();
    });
  });

  describe('when animation ends', () => {
    it('should call onAnimationEnd callback when animationend event fires', async () => {
      const onAnimationEnd = vi.fn();
      const {parts: allParts} = await renderComponent({onAnimationEnd});
      const container = allParts.container as HTMLElement;

      container.dispatchEvent(new AnimationEvent('animationend'));

      expect(onAnimationEnd).toHaveBeenCalled();
    });

    it('should not call onAnimationEnd if callback is not provided', async () => {
      const {parts: allParts} = await renderComponent({
        onAnimationEnd: undefined,
      });
      const container = allParts.container as HTMLElement;

      expect(() => {
        container.dispatchEvent(new AnimationEvent('animationend'));
      }).not.toThrow();
    });

    it('should call onAnimationEnd multiple times if animation ends multiple times', async () => {
      const onAnimationEnd = vi.fn();
      const {parts: allParts} = await renderComponent({onAnimationEnd});
      const container = allParts.container as HTMLElement;

      container.dispatchEvent(new AnimationEvent('animationend'));
      container.dispatchEvent(new AnimationEvent('animationend'));

      expect(onAnimationEnd).toHaveBeenCalledTimes(2);
    });
  });

  describe('when content is conditional', () => {
    it('should render nothing when header content is not provided', async () => {
      const {parts: allParts} = await renderComponent({header: nothing});

      expect(allParts.header?.textContent?.trim()).toBe('');
    });

    it('should render nothing when body content is not provided', async () => {
      const {parts: allParts} = await renderComponent({body: nothing});

      expect(allParts.body?.textContent?.trim()).toBe('');
    });

    it('should render nothing when footer content is not provided', async () => {
      const {parts: allParts} = await renderComponent({footer: nothing});

      expect(allParts.footer?.textContent?.trim()).toBe('');
    });
  });

  describe('when rendering with all features combined', () => {
    it('should render correctly with open visibility and footer slot', async () => {
      const onAnimationEnd = vi.fn();
      const {parts: allParts} = await renderComponent({
        visibility: 'open',
        displayFooterSlot: true,
        onAnimationEnd,
      });
      const container = allParts.container as HTMLElement;

      expect(container.classList.contains('visible')).toBe(true);
      expect(allParts.footerWrapper).toBeTruthy();
      expect(allParts.header).toHaveTextContent('Header Content');
      expect(allParts.body).toHaveTextContent('Body Content');
      expect(allParts.footer).toHaveTextContent('Footer Button');
      container.dispatchEvent(new AnimationEvent('animationend'));
      expect(onAnimationEnd).toHaveBeenCalled();
    });

    it('should render correctly with closed visibility and no footer', async () => {
      const {parts: allParts} = await renderComponent({
        visibility: 'closed',
        displayFooterSlot: false,
      });
      const container = allParts.container as HTMLElement;

      expect(container.classList.contains('invisible')).toBe(true);
      expect(allParts.footerWrapper).toBeFalsy();
      expect(allParts.footer).toBeFalsy();
    });
  });
});
