import {html, render} from 'lit';
import {fireEvent, within} from 'storybook/test';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderTabButton, type TabButtonProps} from './tab-button';

describe('renderTabButton', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderTab = (
    props: Partial<TabButtonProps> = {}
  ): {container: HTMLElement; button: HTMLButtonElement} => {
    const defaultProps: TabButtonProps = {
      label: 'Test Tab',
      active: false,
      select: vi.fn(),
      ...props,
    };

    render(html`${renderTabButton({props: defaultProps})()}`, container);

    const buttonContainer = container.querySelector('[role="listitem"]');
    const button = within(container).getByRole('button') as HTMLButtonElement;

    return {container: buttonContainer as HTMLElement, button};
  };

  describe('basic rendering', () => {
    it('should render a tab button in the document', () => {
      const {button} = renderTab();
      expect(button).toBeInTheDocument();
    });

    it('should render the label text', () => {
      const {button} = renderTab({label: 'Products'});
      expect(button).toHaveTextContent('Products');
    });

    it('should render with listitem role on container', () => {
      const {container} = renderTab();
      expect(container).toHaveAttribute('role', 'listitem');
    });

    it('should have correct aria-label', () => {
      const {container} = renderTab({label: 'Services'});
      expect(container).toHaveAttribute('aria-label', 'tab for Services');
    });
  });

  describe('when active is false', () => {
    it('should set aria-current to false', () => {
      const {container} = renderTab({active: false});
      expect(container).toHaveAttribute('aria-current', 'false');
    });

    it('should have button-container part', () => {
      const {container} = renderTab({active: false});
      expect(container).toHaveAttribute('part', 'button-container');
    });

    it('should have tab-button part on button', () => {
      const {button} = renderTab({active: false});
      expect(button).toHaveAttribute('part', 'tab-button');
    });

    it('should not have active indicator classes', () => {
      const {container} = renderTab({active: false});
      expect(container.className).not.toContain('after:block');
      expect(container.className).not.toContain('after:bg-primary');
    });

    it('should have text-neutral-dark class on button', () => {
      const {button} = renderTab({active: false});
      expect(button.className).toContain('text-neutral-dark');
    });
  });

  describe('when active is true', () => {
    it('should set aria-current to true', () => {
      const {container} = renderTab({active: true});
      expect(container).toHaveAttribute('aria-current', 'true');
    });

    it('should have button-container-active part', () => {
      const {container} = renderTab({active: true});
      expect(container).toHaveAttribute('part', 'button-container-active');
    });

    it('should have tab-button-active part on button', () => {
      const {button} = renderTab({active: true});
      expect(button).toHaveAttribute('part', 'tab-button-active');
    });

    it('should have active indicator classes', () => {
      const {container} = renderTab({active: true});
      expect(container.className).toContain('after:block');
      expect(container.className).toContain('after:bg-primary');
      expect(container.className).toContain('relative');
    });

    it('should not have text-neutral-dark class on button', () => {
      const {button} = renderTab({active: true});
      expect(button.className).not.toContain('text-neutral-dark');
    });
  });

  describe('interactions', () => {
    it('should call select when button is clicked', () => {
      const selectFn = vi.fn();
      const {button} = renderTab({select: selectFn});

      fireEvent.click(button);

      expect(selectFn).toHaveBeenCalledOnce();
    });

    it('should not call select on initial render', () => {
      const selectFn = vi.fn();
      renderTab({select: selectFn});

      expect(selectFn).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have correct base classes on button', () => {
      const {button} = renderTab();
      expect(button.className).toContain('w-full');
      expect(button.className).toContain('truncate');
      expect(button.className).toContain('px-2');
      expect(button.className).toContain('pb-1');
      expect(button.className).toContain('text-xl');
      expect(button.className).toContain('hover:text-primary');
    });

    it('should have responsive padding classes', () => {
      const {button} = renderTab();
      expect(button.className).toContain('sm:px-6');
    });
  });
});
