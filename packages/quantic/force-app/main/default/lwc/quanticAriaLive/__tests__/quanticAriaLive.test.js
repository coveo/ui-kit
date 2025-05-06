import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';
import QuanticAriaLive from 'c/quanticAriaLive';

const createTestComponent = buildCreateTestComponent(
  QuanticAriaLive,
  'c-quantic-aria-live'
);

describe('c-quantic-aria-live', () => {
  afterEach(() => {
    cleanup();
  });

  describe('registerRegion', () => {
    it('should register a new region with default values', async () => {
      const element = createTestComponent();
      element.registerRegion('testRegion');
      await flushPromises();

      const region = element.shadowRoot.querySelector(
        '[data-key="testRegion"]'
      );
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.textContent).toBe('');
    });

    it('should register a new region with assertive set to true', async () => {
      const element = createTestComponent();
      element.registerRegion('testRegion', true);
      await flushPromises();

      const region = element.shadowRoot.querySelector(
        '[data-key="testRegion"]'
      );
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-live')).toBe('assertive');
      expect(region.textContent).toBe('');
    });

    it('should not overwrite an existing region', async () => {
      const element = createTestComponent();
      element.registerRegion('testRegion');
      element.registerRegion('testRegion', true);
      await flushPromises();

      const region = element.shadowRoot.querySelector(
        '[data-key="testRegion"]'
      );
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-live')).toBe('polite'); // Should not override the initial aria-live attribute
      expect(region.textContent).toBe('');
    });
  });

  describe('updateMessage', () => {
    it('should update the message and assertive property of an existing region', async () => {
      const element = createTestComponent();
      await flushPromises();
      element.registerRegion('testRegion');
      element.updateMessage('testRegion', 'New message', true);
      await flushPromises();

      const region = element.shadowRoot.querySelector(
        '[data-key="testRegion"]'
      );
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-live')).toBe('assertive');
      expect(region.textContent).toBe('New message');
    });

    it('should create a new region if it does not exist', async () => {
      const element = createTestComponent();
      element.updateMessage('newRegion', 'Hello world', false);
      await flushPromises();

      const region = element.shadowRoot.querySelector('[data-key="newRegion"]');
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.textContent).toBe('Hello world');
    });
  });

  describe('when multiple regions are registered', () => {
    it('should correctly handle multiple regions', async () => {
      const element = createTestComponent();
      element.registerRegion('region1');
      element.updateMessage('region1', 'Message 1', true);
      element.registerRegion('region2');
      element.updateMessage('region2', 'Message 2');
      await flushPromises();

      const regions = element.shadowRoot.querySelectorAll('[data-key]');
      expect(regions.length).toBe(2);
      const region1 = element.shadowRoot.querySelector('[data-key="region1"]');
      expect(region1).not.toBeNull();
      expect(region1.getAttribute('aria-live')).toBe('assertive');
      expect(region1.textContent).toBe('Message 1');

      const region2 = element.shadowRoot.querySelector('[data-key="region2"]');
      expect(region2).not.toBeNull();
      expect(region2.getAttribute('aria-live')).toBe('polite');
      expect(region2.textContent).toBe('Message 2');
    });
  });
});
