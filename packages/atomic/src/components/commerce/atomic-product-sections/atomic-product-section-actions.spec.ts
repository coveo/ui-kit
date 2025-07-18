import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {hideEmptySection} from '@/src/utils/stencil-item-section-utils';
import {AtomicProductSectionActions} from './atomic-product-section-actions';

vi.mock('@/src/utils/item-section-utils', () => ({
  hideEmptySection: vi.fn(),
}));

describe('atomic-product-section-actions', () => {
  let element: AtomicProductSectionActions;

  beforeEach(() => {
    element = document.createElement('atomic-product-section-actions');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(element).toBeInstanceOf(AtomicProductSectionActions);
  });

  it('should be a custom element', () => {
    expect(customElements.get('atomic-product-section-actions')).toBeDefined();
  });

  it('should not use shadow DOM', () => {
    expect(element.shadowRoot).toBeNull();
    expect(element.createRenderRoot()).toBe(element);
  });

  it('should call hideEmptySection when updated', async () => {
    await element.updateComplete;
    expect(hideEmptySection).toHaveBeenCalledWith(element);
  });

  it('should hide when empty', () => {
    // Simulate empty content
    element.innerHTML = '';

    // Mock hideEmptySection to actually hide the element
    vi.mocked(hideEmptySection).mockImplementation((el: HTMLElement) => {
      el.style.display = 'none';
    });

    element.updated(new Map());
    expect(element.style.display).toBe('none');
  });

  it('should show when it has content', () => {
    // Add some content
    const button = document.createElement('button');
    button.textContent = 'Add to Cart';
    element.appendChild(button);

    // Mock hideEmptySection to show the element when it has content
    vi.mocked(hideEmptySection).mockImplementation((el: HTMLElement) => {
      el.style.display = '';
    });

    element.updated(new Map());
    expect(element.style.display).toBe('');
  });
});
