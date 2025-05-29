// @ts-ignore
import QuanticModal from 'c/quanticModal';
import {getFirstFocusableElement} from 'c/quanticUtils';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => {
  return {
    getFirstFocusableElement: jest.fn(),
    getLastFocusableElement: jest.fn(),
  };
});

const createTestComponent = buildCreateTestComponent(
  QuanticModal,
  'c-quantic-modal'
);

const selectors = {
  modal: '.modal',
  modalHeader: '.modal__header',
  modalContent: '.modal__content',
  modalFooter: '.modal__footer',
  renderingError: '.error-message',
  headerSlot: 'slot[name="header"]',
};

describe('c-quantic-modal', () => {
  afterEach(() => {
    cleanup();
  });

  describe('when using default options', () => {
    it('should not display the modal by default', async () => {
      const element = createTestComponent();
      await flushPromises();
      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('modal_hidden')).toBe(true);
    });

    it('should have slide-to-top animation class by default', async () => {
      const element = createTestComponent();
      await flushPromises();

      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('hidden-modal_slide-to-top')).toBe(true);
    });

    it('should display the modal when openModal is called', async () => {
      const element = createTestComponent();
      element.openModal();
      await flushPromises();

      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('modal_hidden')).toBe(false);

      expect(
        element.shadowRoot.querySelector(selectors.modalHeader)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.modalContent)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.modalFooter)
      ).not.toBeNull();

      expect(modal.classList.contains('full-screen')).toBe(false);
      expect(modal.classList.contains('part-screen')).toBe(true);
    });

    it('should hide the modal when closeModal is called', async () => {
      const element = createTestComponent();
      element.openModal();
      await flushPromises();
      element.closeModal();
      await flushPromises();
      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('modal_hidden')).toBe(true);
    });

    describe('when the modal is opened', () => {
      beforeAll(() => {
        jest.useFakeTimers();
      });
      afterAll(() => {
        jest.useRealTimers();
      });

      it('should focus on first focusable element when modal opens', async () => {
        const mockFirstFocusableElement = {focus: jest.fn()};
        // @ts-ignore
        getFirstFocusableElement.mockImplementation(
          () => mockFirstFocusableElement
        );

        const element = createTestComponent();

        const headerSlot = element.shadowRoot.querySelector(
          selectors.headerSlot
        );

        const headerSlotSpy = jest
          .spyOn(headerSlot, 'assignedElements')
          .mockImplementation(() => [document.createElement('div')]);

        element.openModal();
        jest.runAllTimers();
        expect(getFirstFocusableElement).toHaveBeenCalled();
        expect(mockFirstFocusableElement.focus).toHaveBeenCalled();

        headerSlotSpy.mockRestore();
      });
    });
  });

  describe('when using slide to left animation', () => {
    it('should have slide-to-left animation class', async () => {
      const element = createTestComponent({animation: 'slideToLeft'});
      await flushPromises();

      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('hidden-modal_slide-to-left')).toBe(true);
    });

    it('should display the modal with slide-to-left animation when opened', async () => {
      const element = createTestComponent({animation: 'slideToLeft'});
      await flushPromises();
      element.openModal();
      await flushPromises();

      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('modal_hidden')).toBe(false);
      expect(modal.classList.contains('part-screen')).toBe(true);
    });
  });

  describe('when fullScreen is set to true', () => {
    it('should apply full-screen class to the modal', async () => {
      const element = createTestComponent({fullScreen: true});
      await flushPromises();
      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('full-screen')).toBe(true);
    });

    it('should display the modal in full screen when opened', async () => {
      const element = createTestComponent({fullScreen: true});
      await flushPromises();
      element.openModal();
      await flushPromises();
      const modal = element.shadowRoot.querySelector(selectors.modal);
      expect(modal.classList.contains('modal_hidden')).toBe(false);
      expect(modal.classList.contains('full-screen')).toBe(true);
    });
  });

  describe('when setting an invalid animation', () => {
    it('should display an error message', async () => {
      const invalidAnimation = 'invalid animation';
      const element = createTestComponent({animation: invalidAnimation});
      await flushPromises();

      const errorElement = element.shadowRoot.querySelector(
        selectors.renderingError
      );
      expect(errorElement).not.toBeNull();
      expect(errorElement.textContent).toContain(
        `"${invalidAnimation}" is an invalid value for the animation property`
      );
    });
  });

  describe('when setting an invalid fullscreen value', () => {
    it('should display an error message', async () => {
      const element = createTestComponent({fullScreen: 'patate'});
      await flushPromises();

      const errorElement = element.shadowRoot.querySelector(
        selectors.renderingError
      );
      expect(errorElement).not.toBeNull();
      expect(errorElement.textContent).toContain(
        `"patate" is an invalid value for the full-screen property`
      );
    });
  });

  describe('focus management and accessibility', () => {
    it('should set appropriate ARIA attributes', async () => {
      const element = createTestComponent();
      await flushPromises();
      element.openModal();
      await flushPromises();

      const modalElement = element.shadowRoot.querySelector('[role="dialog"]');

      expect(modalElement).not.toBeNull();
      expect(modalElement.getAttribute('aria-modal')).toBe('true');

      const labelledBy = modalElement.getAttribute('aria-labelledby');
      expect(labelledBy).toMatch(/^modal-heading/);

      const describedBy = modalElement.getAttribute('aria-describedby');
      expect(describedBy).toMatch(/^modal-content/);
    });
  });
});
