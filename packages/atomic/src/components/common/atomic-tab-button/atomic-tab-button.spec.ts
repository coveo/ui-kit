import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
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

    const getContainer = () =>
      element.shadowRoot?.querySelector('[role="listitem"]') as HTMLElement;
    const getButton = () =>
      element.shadowRoot?.querySelector('button') as HTMLButtonElement;

    return {
      element,
      container: getContainer(),
      button: getButton(),
      locators: {
        button: page.getByRole('button'),
      },
    };
  };

  it('should render in the document', async () => {
    const {element} = await renderTabButton();
    await expect.element(element).toBeInTheDocument();
  });

  it('should render the label text', async () => {
    const {locators} = await renderTabButton({label: 'Products'});
    await expect.element(locators.button).toHaveTextContent('Products');
  });

  it('should render with listitem role on container', async () => {
    const {container} = await renderTabButton();
    expect(container).toHaveAttribute('role', 'listitem');
  });

  describe('when active is false', () => {
    it('should set aria-current to false', async () => {
      const {container} = await renderTabButton({active: false});
      expect(container).toHaveAttribute('aria-current', 'false');
    });

    it('should have button-container part', async () => {
      const {container} = await renderTabButton({active: false});
      expect(container).toHaveAttribute('part', 'button-container');
    });

    it('should have tab-button part on button', async () => {
      const {button} = await renderTabButton({active: false});
      expect(button).toHaveAttribute('part', 'tab-button');
    });

    it('should not have active indicator classes', async () => {
      const {container} = await renderTabButton({active: false});
      expect(container.className).not.toContain('after:block');
      expect(container.className).not.toContain('after:bg-primary');
    });

    it('should have text-neutral-dark class on button', async () => {
      const {button} = await renderTabButton({active: false});
      expect(button.className).toContain('text-neutral-dark');
    });
  });

  describe('when active is true', () => {
    it('should set aria-current to true', async () => {
      const {container} = await renderTabButton({active: true});
      expect(container).toHaveAttribute('aria-current', 'true');
    });

    it('should have button-container-active part', async () => {
      const {container} = await renderTabButton({active: true});
      expect(container).toHaveAttribute('part', 'button-container-active');
    });

    it('should have tab-button-active part on button', async () => {
      const {button} = await renderTabButton({active: true});
      expect(button).toHaveAttribute('part', 'tab-button-active');
    });

    it('should have active indicator classes', async () => {
      const {container} = await renderTabButton({active: true});
      expect(container.className).toContain('after:block');
      expect(container.className).toContain('after:bg-primary');
      expect(container.className).toContain('relative');
    });

    it('should not have text-neutral-dark class on button', async () => {
      const {button} = await renderTabButton({active: true});
      expect(button.className).not.toContain('text-neutral-dark');
    });
  });

  it('should set aria-label with the label', async () => {
    const {container} = await renderTabButton({label: 'My Tab'});
    expect(container).toHaveAttribute('aria-label', 'tab for My Tab');
  });

  it('should call select when button is clicked', async () => {
    const selectFn = vi.fn();
    const {button} = await renderTabButton({select: selectFn});

    button.click();

    expect(selectFn).toHaveBeenCalledOnce();
  });
});
