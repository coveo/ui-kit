import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderTabButton, type TabButtonProps} from './tab-button';

describe('renderTabButton', () => {
  const renderTab = async (
    props: Partial<TabButtonProps> = {}
  ): Promise<{container: HTMLElement; button: HTMLButtonElement}> => {
    const defaultProps: TabButtonProps = {
      label: 'Test Tab',
      active: false,
      select: vi.fn(),
      ...props,
    };

    const element = await renderFunctionFixture(
      html`${renderTabButton({props: defaultProps})()}`
    );

    const buttonContainer = element.querySelector(
      '[role="listitem"]'
    ) as HTMLElement;
    const button = element.querySelector('button') as HTMLButtonElement;

    return {container: buttonContainer, button};
  };

  describe('basic rendering', () => {
    it('should render a tab button in the document', async () => {
      const {button} = await renderTab();
      expect(button).toBeInTheDocument();
    });

    it('should render the label text', async () => {
      const {button} = await renderTab({label: 'Products'});
      expect(button).toHaveTextContent('Products');
    });

    it('should render with listitem role on container', async () => {
      const {container} = await renderTab();
      expect(container).toHaveAttribute('role', 'listitem');
    });

    it('should have correct aria-label', async () => {
      const {container} = await renderTab({label: 'Services'});
      expect(container).toHaveAttribute('aria-label', 'tab for Services');
    });
  });

  describe('when active is false', () => {
    it('should set aria-current to false', async () => {
      const {container} = await renderTab({active: false});
      expect(container).toHaveAttribute('aria-current', 'false');
    });

    it('should have button-container part', async () => {
      const {container} = await renderTab({active: false});
      expect(container).toHaveAttribute('part', 'button-container');
    });

    it('should have tab-button part on button', async () => {
      const {button} = await renderTab({active: false});
      expect(button).toHaveAttribute('part', 'tab-button');
    });

    it('should not have active indicator classes', async () => {
      const {container} = await renderTab({active: false});
      expect(container.className).not.toContain('after:block');
      expect(container.className).not.toContain('after:bg-primary');
    });

    it('should have text-neutral-dark class on button', async () => {
      const {button} = await renderTab({active: false});
      expect(button.className).toContain('text-neutral-dark');
    });
  });

  describe('when active is true', () => {
    it('should set aria-current to true', async () => {
      const {container} = await renderTab({active: true});
      expect(container).toHaveAttribute('aria-current', 'true');
    });

    it('should have button-container-active part', async () => {
      const {container} = await renderTab({active: true});
      expect(container).toHaveAttribute('part', 'button-container-active');
    });

    it('should have tab-button-active part on button', async () => {
      const {button} = await renderTab({active: true});
      expect(button).toHaveAttribute('part', 'tab-button-active');
    });

    it('should have active indicator classes', async () => {
      const {container} = await renderTab({active: true});
      expect(container.className).toContain('after:block');
      expect(container.className).toContain('after:bg-primary');
      expect(container.className).toContain('relative');
    });

    it('should not have text-neutral-dark class on button', async () => {
      const {button} = await renderTab({active: true});
      expect(button.className).not.toContain('text-neutral-dark');
    });
  });

  describe('interactions', () => {
    it('should call select when button is clicked', async () => {
      const selectFn = vi.fn();
      const {button} = await renderTab({select: selectFn});

      button.click();

      expect(selectFn).toHaveBeenCalledOnce();
    });

    it('should not call select on initial render', async () => {
      const selectFn = vi.fn();
      await renderTab({select: selectFn});

      expect(selectFn).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have correct base classes on button', async () => {
      const {button} = await renderTab();
      expect(button.className).toContain('w-full');
      expect(button.className).toContain('truncate');
      expect(button.className).toContain('px-2');
      expect(button.className).toContain('pb-1');
      expect(button.className).toContain('text-xl');
      expect(button.className).toContain('hover:text-primary');
    });

    it('should have responsive padding classes', async () => {
      const {button} = await renderTab();
      expect(button.className).toContain('sm:px-6');
    });
  });
});
