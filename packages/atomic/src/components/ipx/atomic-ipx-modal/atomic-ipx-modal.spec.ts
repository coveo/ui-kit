import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicIpxModal} from './atomic-ipx-modal';
import './atomic-ipx-modal';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-ipx-modal', () => {
  const mockedEngine = buildFakeSearchEngine();

  beforeEach(() => {
    document.body.className = '';
  });

  const renderIPXModal = async ({
    props = {},
    slottedContent = {
      header: '',
      body: '',
      footer: '',
    },
  }: {
    props?: {
      isOpen?: boolean;
      source?: HTMLElement;
      container?: HTMLElement;
    };
    slottedContent?: {
      header: string;
      body: string;
      footer: string;
    };
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicIpxModal>({
      template: html`
        <atomic-ipx-modal
          .isOpen=${props.isOpen ?? false}
          .source=${props.source}
          .container=${props.container}
        >
          ${
            slottedContent.header
              ? html`<div slot="header">${slottedContent.header}</div>`
              : ''
          }
          ${
            slottedContent.body
              ? html`<div slot="body">${slottedContent.body}</div>`
              : ''
          }
          ${
            slottedContent.footer
              ? html`<div slot="footer">${slottedContent.footer}</div>`
              : ''
          }
        </atomic-ipx-modal>
      `,
      selector: 'atomic-ipx-modal',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      parts: {
        backdrop: element.shadowRoot?.querySelector('[part="backdrop"]'),
        body: element.shadowRoot?.querySelector(
          'atomic-ipx-body'
        ) as HTMLElement & {isOpen?: boolean; displayFooterSlot?: boolean},
      },
    };
  };

  describe('when rendering', () => {
    it('should render the modal with all parts', async () => {
      const {element, parts} = await renderIPXModal();

      expect(element).toBeInTheDocument();
      expect(parts.backdrop).toBeInTheDocument();
      expect(parts.body).toBeInTheDocument();
    });

    it('should set part attribute on host element', async () => {
      const {element} = await renderIPXModal();

      expect(element.getAttribute('part')).toBe('atomic-ipx-modal');
    });

    it('should render with header slot content', async () => {
      const {element} = await renderIPXModal({
        slottedContent: {
          header: 'Test Header',
          body: '',
          footer: '',
        },
      });

      const headerSlot = element.querySelector('[slot="header"]');
      expect(headerSlot).toHaveTextContent('Test Header');
    });

    it('should render with body slot content', async () => {
      const {element} = await renderIPXModal({
        slottedContent: {
          header: '',
          body: 'Test Body',
          footer: '',
        },
      });

      const bodySlot = element.querySelector('[slot="body"]');
      expect(bodySlot).toHaveTextContent('Test Body');
    });

    it('should render with footer slot content', async () => {
      const {element} = await renderIPXModal({
        slottedContent: {
          header: '',
          body: '',
          footer: 'Test Footer',
        },
      });

      const footerSlot = element.querySelector('[slot="footer"]');
      expect(footerSlot).toHaveTextContent('Test Footer');
    });

    it('should render without footer slot when not provided', async () => {
      const {element} = await renderIPXModal({
        slottedContent: {
          header: 'Header',
          body: 'Body',
          footer: '',
        },
      });

      await element.updateComplete;

      const footerSlot = element.querySelector('[slot="footer"]');
      expect(footerSlot).not.toBeInTheDocument();
    });
  });

  describe('when initializing', () => {
    it('should generate an ID when not provided', async () => {
      const {element} = await renderIPXModal();

      expect(element.id).toMatch(/^atomic-ipx-modal-/);
    });

    it('should preserve existing ID when already set', async () => {
      const {element} = await renderInAtomicSearchInterface<AtomicIpxModal>({
        template: html`<atomic-ipx-modal id="custom-id"></atomic-ipx-modal>`,
        selector: 'atomic-ipx-modal',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

      expect(element.id).toBe('custom-id');
    });
  });

  describe('when handling touch events', () => {
    it('should add touchmove event listener on connection', async () => {
      const addEventListenerSpy = vi.spyOn(document.body, 'addEventListener');

      await renderIPXModal();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function),
        {passive: false}
      );
    });

    it('should remove touchmove event listener on disconnection', async () => {
      const removeEventListenerSpy = vi.spyOn(
        document.body,
        'removeEventListener'
      );

      const {element} = await renderIPXModal();
      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function)
      );
    });

    it('should prevent default on touchmove when modal is open', async () => {
      await renderIPXModal({props: {isOpen: true}});

      const event = new Event('touchmove', {cancelable: true});
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.body.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default on touchmove when modal is closed', async () => {
      await renderIPXModal({props: {isOpen: false}});

      const event = new Event('touchmove', {cancelable: true});
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.body.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('when setting properties', () => {
    it('should have isOpen=false by default', async () => {
      const {element} = await renderIPXModal();

      expect(element.isOpen).toBe(false);
    });

    it('should set isOpen=true when provided', async () => {
      const {element} = await renderIPXModal({
        props: {isOpen: true},
      });

      expect(element.isOpen).toBe(true);
    });

    it('should toggle open class and document.body class when isOpen changes', async () => {
      const {element} = await renderIPXModal({
        props: {isOpen: false},
      });

      expect(element).not.toHaveClass('open');
      expect(document.body.classList.contains('atomic-ipx-modal-opened')).toBe(
        false
      );

      element.isOpen = true;
      await element.updateComplete;

      expect(element).toHaveClass('open');
      expect(document.body.classList.contains('atomic-ipx-modal-opened')).toBe(
        true
      );

      element.isOpen = false;
      await element.updateComplete;

      expect(element).not.toHaveClass('open');
      expect(document.body.classList.contains('atomic-ipx-modal-opened')).toBe(
        false
      );
    });

    it('should accept the #source property', async () => {
      const sourceElement = document.createElement('button');
      const {element} = await renderIPXModal({
        props: {source: sourceElement},
      });

      expect(element.source).toBe(sourceElement);
    });

    it('should accept the #container property', async () => {
      const containerElement = document.createElement('div');
      const {element} = await renderIPXModal({
        props: {container: containerElement},
      });

      expect(element.container).toBe(containerElement);
    });
  });

  describe('when integrating with atomic-ipx-body', () => {
    it('should pass isOpen to atomic-ipx-body', async () => {
      const {parts} = await renderIPXModal({props: {isOpen: true}});

      expect(parts.body?.isOpen).toBe(true);
    });

    it('should pass displayFooterSlot to atomic-ipx-body when footer exists', async () => {
      const {parts} = await renderIPXModal({
        slottedContent: {
          header: '',
          body: '',
          footer: 'Footer content',
        },
      });

      expect(parts.body?.displayFooterSlot).toBe(true);
    });

    it('should pass displayFooterSlot=false to atomic-ipx-body when footer is missing', async () => {
      const {element, parts} = await renderIPXModal({
        slottedContent: {
          header: '',
          body: '',
          footer: '',
        },
      });

      await element.updateComplete;

      expect(parts.body?.displayFooterSlot).toBe(false);
    });

    it('should export parts from atomic-ipx-body', async () => {
      const {parts} = await renderIPXModal();

      expect(parts.body?.getAttribute('exportparts')).toBe('container');
    });
  });
});
