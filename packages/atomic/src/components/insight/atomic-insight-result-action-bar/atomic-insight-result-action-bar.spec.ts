import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicInsightResultActionBar} from './atomic-insight-result-action-bar';
import './atomic-insight-result-action-bar';

describe('atomic-insight-result-action-bar', () => {
  const renderActionBar = async (slottedContent?: unknown) => {
    const element = await fixture<AtomicInsightResultActionBar>(
      html`<atomic-insight-result-action-bar
        >${slottedContent}</atomic-insight-result-action-bar
      >`
    );
    return {element};
  };

  it('should hide itself when empty', async () => {
    const {element} = await renderActionBar();
    expect(element.style.display).toBe('none');
  });

  it('should be visible when containing visual elements', async () => {
    const {element} = await renderActionBar(html`<button>Action</button>`);
    expect(element.style.display).toBe('');
  });

  it('should render slotted content in light DOM', async () => {
    const {element} = await renderActionBar(html`<button>Test Action</button>`);
    const button = element.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Test Action');
  });
});
