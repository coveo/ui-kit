import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/atomic-test-interface';
import {mockEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/mock-engine';
import type {AtomicIPXModal} from './atomic-ipx-modal';

describe('atomic-ipx-modal', () => {
  const renderIPXModal = async ({
    props = {},
    slottedContent = {
      header: '',
      body: '',
      footer: '',
    },
  } = {}) => {
    const {element} = await renderInAtomicSearchInterface<AtomicIPXModal>({
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
        bindings.engine = mockEngine;
        return bindings;
      },
    });

    return {
      element,
      parts: {
        modal: element.shadowRoot?.querySelector('[part="atomic-ipx-modal"]'),
        backdrop: element.shadowRoot?.querySelector('[part="backdrop"]'),
        body: element.shadowRoot?.querySelector('atomic-ipx-body'),
      },
    };
  };

  describe('rendering', () => {
    it('should render the modal with all parts', async () => {
      const {parts} = await renderIPXModal();

      expect(parts.modal).toBeInTheDocument();
      expect(parts.backdrop).toBeInTheDocument();
      expect(parts.body).toBeInTheDocument();
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

  describe('isOpen property', () => {
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

    it('should add "open" class to modal when isOpen=true', async () => {
      const {element, parts} = await renderIPXModal({
        props: {isOpen: true},
      });

      await element.updateComplete;

      expect(parts.modal).toHaveClass('open');
    });

    it('should not have "open" class when isOpen=false', async () => {
      const {parts} = await renderIPXModal({
        props: {isOpen: false},
      });

      expect(parts.modal).not.toHaveClass('open');
    });

    it('should always have "dialog" class', async () => {
      const {parts} = await renderIPXModal();

      expect(parts.modal).toHaveClass('dialog');
    });
  });

  describe('modal opened class management', () => {
    beforeEach(() => {
      document.body.className = '';
    });

    it('should add atomic-ipx-modal-opened class to document.body when isOpen=true', async () => {
      await renderIPXModal({props: {isOpen: true}});

      expect(document.body.classList.contains('atomic-ipx-modal-opened')).toBe(
        true
      );
    });

    it('should remove atomic-ipx-modal-opened class from document.body when isOpen=false', async () => {
      const {element} = await renderIPXModal({props: {isOpen: true}});

      expect(document.body.classList.contains('atomic-ipx-modal-opened')).toBe(
        true
      );

      element.isOpen = false;
      await element.updateComplete;

      expect(document.body.classList.contains('atomic-ipx-modal-opened')).toBe(
        false
      );
    });

    it('should add atomic-ipx-modal-opened class to interfaceElement when isOpen=true', async () => {
      const {element} = await renderIPXModal({props: {isOpen: true}});

      expect(
        element.bindings.interfaceElement.classList.contains(
          'atomic-ipx-modal-opened'
        )
      ).toBe(true);
    });

    it('should remove atomic-ipx-modal-opened class from interfaceElement when isOpen=false', async () => {
      const {element} = await renderIPXModal({props: {isOpen: true}});

      expect(
        element.bindings.interfaceElement.classList.contains(
          'atomic-ipx-modal-opened'
        )
      ).toBe(true);

      element.isOpen = false;
      await element.updateComplete;

      expect(
        element.bindings.interfaceElement.classList.contains(
          'atomic-ipx-modal-opened'
        )
      ).toBe(false);
    });
  });

  describe('lifecycle', () => {
    it('should generate an ID when not provided', async () => {
      const {element} = await renderIPXModal();

      expect(element.id).toMatch(/^atomic-ipx-modal-/);
    });

    it('should preserve existing ID', async () => {
      const {element} = await renderIPXModal();
      element.id = 'custom-id';
      await element.updateComplete;

      // Trigger firstUpdated by re-rendering
      element.requestUpdate();
      await element.updateComplete;

      expect(element.id).toBe('custom-id');
    });
  });

  describe('touch event handling', () => {
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

  describe('properties', () => {
    it('should accept source property', async () => {
      const sourceElement = document.createElement('button');
      const {element} = await renderIPXModal({
        props: {source: sourceElement},
      });

      expect(element.source).toBe(sourceElement);
    });

    it('should accept container property', async () => {
      const containerElement = document.createElement('div');
      const {element} = await renderIPXModal({
        props: {container: containerElement},
      });

      expect(element.container).toBe(containerElement);
    });
  });

  describe('atomic-ipx-body integration', () => {
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
