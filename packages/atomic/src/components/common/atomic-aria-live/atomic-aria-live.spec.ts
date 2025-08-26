import {describe, expect, it, vi} from 'vitest';
import './atomic-aria-live';
import {html} from 'lit-html';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicAriaLive} from './atomic-aria-live';

describe('atomic-aria-live', () => {
  const renderAriaLive = async () => {
    const element = await renderFunctionFixture(
      html`<atomic-aria-live></atomic-aria-live>`
    );

    const ariaLive = element.querySelector(
      'atomic-aria-live'
    ) as AtomicAriaLive;
    return {
      element: ariaLive,
      locators: {
        get regions() {
          return ariaLive.querySelectorAll('[role="status"]');
        },
      },
    };
  };

  it('should add an event listener for "atomic/accessiblity/findAriaLive" on the document', async () => {
    const listenerSpyOn = vi.spyOn(document, 'addEventListener');
    await renderAriaLive();
    expect(listenerSpyOn).toHaveBeenCalledWith(
      'atomic/accessibility/findAriaLive',
      expect.any(Function)
    );
  });

  describe('#updateMessage', () => {
    it('should update the message for a region if a message is provided', async () => {
      const {element, locators} = await renderAriaLive();
      const region = 'test-region';
      const message = 'Test message';
      const assertive = true;

      element.updateMessage(region, message, assertive);

      await expect
        .poll(() => locators.regions[0])
        .toHaveTextContent('Test message');
    });

    it('should update the message immediatly if the message is empty', async () => {
      const {element, locators} = await renderAriaLive();
      const region = 'test-region';
      const message = 'Test message';
      const assertive = true;
      element.updateMessage(region, message, assertive);
      vi.waitFor(() =>
        expect(locators.regions[0]).toHaveTextContent('Test message')
      );

      const newMessage = '';
      element.updateMessage(region, newMessage, assertive);

      await expect.poll(() => locators.regions[0]).toHaveTextContent('');
    });
  });

  describe('#registerRegion', () => {
    it('should add a new region', async () => {
      const {element, locators} = await renderAriaLive();
      const region = 'test-region';
      const assertive = true;
      await expect.poll(() => locators.regions.length).toBe(0);

      element.registerRegion(region, assertive);

      await expect.poll(() => locators.regions.length).toBe(1);
      expect(locators.regions[0]).toHaveAttribute(
        'id',
        expect.stringContaining('test-region')
      );
      expect(locators.regions[0]).toHaveAttribute('aria-live', 'assertive');
    });

    it('should add a region as assertive if "assertive" is true', async () => {
      const {element, locators} = await renderAriaLive();
      const region = 'test-region';
      const assertive = true;

      element.registerRegion(region, assertive);

      await expect
        .poll(() => locators.regions[0])
        .toHaveAttribute('aria-live', 'assertive');
    });

    it('should add a region as polite if "assertive" is false', async () => {
      const {element, locators} = await renderAriaLive();
      const region = 'test-region';
      const assertive = false;

      element.registerRegion(region, assertive);

      await expect
        .poll(() => locators.regions[0])
        .toHaveAttribute('aria-live', 'polite');
    });
  });
});
