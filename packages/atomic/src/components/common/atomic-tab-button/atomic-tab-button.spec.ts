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

    const getButton = () =>
      element.shadowRoot?.querySelector('button') as HTMLButtonElement;

    return {
      element,
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

  it('should render with listitem role on host element', async () => {
    const {element} = await renderTabButton();
    expect(element).toHaveAttribute('role', 'listitem');
  });

  describe('when active is false', () => {
    it('should set aria-current to false', async () => {
      const {element} = await renderTabButton({active: false});
      expect(element).toHaveAttribute('aria-current', 'false');
    });

    it('should have tab-button part on button', async () => {
      const {button} = await renderTabButton({active: false});
      expect(button).toHaveAttribute('part', 'tab-button');
    });

    it('should not have active indicator classes on host', async () => {
      const {element} = await renderTabButton({active: false});
      expect(element.className).not.toContain('after:block');
      expect(element.className).not.toContain('after:bg-primary');
    });

    it('should have text-neutral-dark class on button', async () => {
      const {button} = await renderTabButton({active: false});
      expect(button.className).toContain('text-neutral-dark');
    });
  });

  describe('when active is true', () => {
    it('should set aria-current to true', async () => {
      const {element} = await renderTabButton({active: true});
      expect(element).toHaveAttribute('aria-current', 'true');
    });

    it('should have tab-button-active part on button', async () => {
      const {button} = await renderTabButton({active: true});
      expect(button).toHaveAttribute('part', 'tab-button-active');
    });

    it('should have active indicator classes on host', async () => {
      const {element} = await renderTabButton({active: true});
      expect(element.className).toContain('after:block');
      expect(element.className).toContain('after:bg-primary');
      expect(element.className).toContain('relative');
    });

    it('should not have text-neutral-dark class on button', async () => {
      const {button} = await renderTabButton({active: true});
      expect(button.className).not.toContain('text-neutral-dark');
    });
  });

  it('should call select when button is clicked', async () => {
    const selectFn = vi.fn();
    const {button} = await renderTabButton({select: selectFn});

    button.click();

    expect(selectFn).toHaveBeenCalledOnce();
  });
});
