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
      await expect
        .poll(() => locators.regions[0])
        .toHaveTextContent('Test message');

      const newMessage = '';
      element.updateMessage(region, newMessage, assertive);

      await expect.poll(() => locators.regions[0]).toHaveTextContent('');
    });

    it('should announce distinct messages for the same region in order', async () => {
      const {element, locators} = await renderAriaLive();

      element.updateMessage('query-summary', 'Results loaded', false);
      element.updateMessage(
        'generated-answer',
        'Generating answer',
        false,
        true
      );
      element.updateMessage(
        'generated-answer',
        'Answer could not be generated',
        false,
        true
      );

      const generatedAnswerRegion = () =>
        Array.from(locators.regions).find((region) =>
          region.id.includes('generated-answer')
        );

      await expect
        .poll(generatedAnswerRegion)
        .toHaveTextContent('Generating answer');
      await expect
        .poll(generatedAnswerRegion)
        .toHaveTextContent('Answer could not be generated');
    });

    it('should replace queued messages for regions that do not preserve them', async () => {
      const {element, locators} = await renderAriaLive();

      element.updateMessage('query-suggestions', 'First suggestion', false);
      element.updateMessage('query-suggestions', 'Second suggestion', false);

      await expect
        .poll(() => locators.regions[0])
        .toHaveTextContent('Second suggestion');
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
