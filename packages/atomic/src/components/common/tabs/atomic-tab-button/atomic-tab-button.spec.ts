import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture, html} from '@/vitest-utils';
import type {AtomicTabButton} from './atomic-tab-button';

describe('atomic-tab-button', () => {
  let element: AtomicTabButton;
  let selectSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    selectSpy = vi.fn();
    element = await fixture<AtomicTabButton>(
      html`<atomic-tab-button
        label="Test Tab"
        .select=${selectSpy}
      ></atomic-tab-button>`
    );
  });

  it('should render with the correct label', async () => {
    await expect.element(element).toBeInTheDocument();
    await expect.element(element).toHaveTextContent('Test Tab');
  });

  it('should have role="listitem"', async () => {
    expect(element.getAttribute('role')).toBe('listitem');
  });

  it('should set aria-current to "false" when not active', async () => {
    expect(element.getAttribute('aria-current')).toBe('false');
  });

  it('should set aria-current to "true" when active', async () => {
    element.active = true;
    await element.updateComplete;
    expect(element.getAttribute('aria-current')).toBe('true');
  });

  it('should set aria-label correctly', async () => {
    expect(element.getAttribute('aria-label')).toBe('tab for Test Tab');
  });

  it('should call select handler when clicked', async () => {
    const button = element.shadowRoot!.querySelector('button');
    expect(button).toBeTruthy();
    button!.click();
    expect(selectSpy).toHaveBeenCalledOnce();
  });

  it('should update aria-label when label changes', async () => {
    element.label = 'New Tab';
    await element.updateComplete;
    expect(element.getAttribute('aria-label')).toBe('tab for New Tab');
  });

  it('should update part attribute when active changes', async () => {
    expect(element.getAttribute('part')).toBe('button-container');
    element.active = true;
    await element.updateComplete;
    expect(element.getAttribute('part')).toBe('button-container-active');
  });
});
