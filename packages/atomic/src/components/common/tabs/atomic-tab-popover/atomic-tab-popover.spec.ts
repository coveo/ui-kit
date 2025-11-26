import type {i18n} from 'i18next';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {fixture, html} from '@/vitest-utils';
import {buildMockEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/buildMockEngine';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-test';
import type {AtomicTabPopover} from './atomic-tab-popover';

describe('atomic-tab-popover', () => {
  let element: AtomicTabPopover;
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(async () => {
    const engine = buildMockEngine();
    element = await fixture<AtomicTabPopover>(
      html`<atomic-tab-popover></atomic-tab-popover>`
    );
    element.bindings = {
      engine,
      i18n,
      interfaceElement: document.createElement('div'),
      store: engine.state,
    };
    element.initialize();
    await element.updateComplete;
  });

  it('should render', async () => {
    await expect.element(element).toBeInTheDocument();
  });

  it('should be hidden initially when show is false', async () => {
    expect(element.style.visibility).toBe('hidden');
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  it('should be visible when show is set to true', async () => {
    element.setButtonVisibility(true);
    await element.updateComplete;
    expect(element.style.visibility).toBe('visible');
    expect(element.getAttribute('aria-hidden')).toBe('false');
  });

  it('should toggle isOpen state when toggle is called', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    const initialOpen = (element as any).isOpen;
    element.toggle();
    await element.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((element as any).isOpen).toBe(!initialOpen);
  });

  it('should render the popover button', async () => {
    element.setButtonVisibility(true);
    await element.updateComplete;
    const button = element.shadowRoot!.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should handle keyboard navigation with Escape', async () => {
    element.setButtonVisibility(true);
    element.toggle();
    await element.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((element as any).isOpen).toBe(true);

    const event = new KeyboardEvent('keydown', {key: 'Escape'});
    element.dispatchEvent(event);
    await element.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((element as any).isOpen).toBe(false);
  });
});
