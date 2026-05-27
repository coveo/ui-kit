import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-tab-button';
import type {AtomicTabButton} from './atomic-tab-button';

describe('atomic-tab-button', () => {
  const renderTabButton = async (
    props: Partial<{
      label: string;
      active: boolean;
      select: () => void;
    }> = {}
  ) => {
    const element = await fixture<AtomicTabButton>(
      html`<atomic-tab-button
        .label=${props.label ?? 'Test Tab'}
        .active=${props.active ?? false}
        .select=${props.select ?? vi.fn()}
      ></atomic-tab-button>`
    );

    return {
      element,
      tabContent: element.querySelector('[part^="tab-button"]'),
    };
  };

  it('should render in the document', async () => {
    const {element} = await renderTabButton();
    expect(element).toBeInTheDocument();
  });

  it('should render the label text', async () => {
    const {element} = await renderTabButton({label: 'Products'});
    expect(element).toHaveTextContent('Products');
  });

  it('should render with tab role on host element', async () => {
    const {element} = await renderTabButton();
    expect(element).toHaveAttribute('role', 'tab');
  });

  describe('when active is false', () => {
    it('should set aria-selected to false on host', async () => {
      const {element} = await renderTabButton({active: false});
      expect(element).toHaveAttribute('aria-selected', 'false');
    });

    it('should not be in the tab order', async () => {
      const {element} = await renderTabButton({active: false});
      expect(element).toHaveAttribute('tabindex', '-1');
    });

    it('should have tab-button part on tab content', async () => {
      const {tabContent} = await renderTabButton({active: false});
      expect(tabContent).toHaveAttribute('part', 'tab-button');
    });

    it('should not have active indicator classes on host', async () => {
      const {element} = await renderTabButton({active: false});
      expect(element.className).not.toContain('after:block');
      expect(element.className).not.toContain('after:bg-primary');
    });

    it('should have text-neutral-dark class on host', async () => {
      const {element} = await renderTabButton({active: false});
      expect(element.className).toContain('text-neutral-dark');
    });
  });

  describe('when active is true', () => {
    it('should set aria-selected to true on host', async () => {
      const {element} = await renderTabButton({active: true});
      expect(element).toHaveAttribute('aria-selected', 'true');
    });

    it('should be in the tab order', async () => {
      const {element} = await renderTabButton({active: true});
      expect(element).toHaveAttribute('tabindex', '0');
    });

    it('should have tab-button-active part on tab content', async () => {
      const {tabContent} = await renderTabButton({active: true});
      expect(tabContent).toHaveAttribute('part', 'tab-button-active');
    });

    it('should have active indicator classes on host', async () => {
      const {element} = await renderTabButton({active: true});
      expect(element.className).toContain('after:block');
      expect(element.className).toContain('after:bg-primary');
      expect(element.className).toContain('relative');
    });

    it('should not have text-neutral-dark class on host', async () => {
      const {element} = await renderTabButton({active: true});
      expect(element.className).not.toContain('text-neutral-dark');
    });
  });

  it('should call select when host is clicked', async () => {
    const selectFn = vi.fn();
    const {element} = await renderTabButton({select: selectFn});

    element.click();

    expect(selectFn).toHaveBeenCalledOnce();
  });

  it('should call select when pressing Enter', async () => {
    const selectFn = vi.fn();
    const {element} = await renderTabButton({select: selectFn});

    element.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

    expect(selectFn).toHaveBeenCalledOnce();
  });
});
