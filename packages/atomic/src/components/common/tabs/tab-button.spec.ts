import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderTabButton, type TabButtonProps} from './tab-button';

describe('#renderTabButton', () => {
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
      html`${renderTabButton({props: defaultProps})}`
    );

    const buttonContainer = element.querySelector(
      '[role="tab"]'
    ) as HTMLElement;
    const button = element.querySelector('button') as HTMLButtonElement;

    return {container: buttonContainer, button};
  };

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
    expect(container).toHaveAttribute('role', 'tab');
  });

  describe('when active is false', () => {
    it('should set aria-selected to false', async () => {
      const {container} = await renderTab({active: false});
      expect(container).toHaveAttribute('aria-selected', 'false');
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
    it('should set aria-selected to true', async () => {
      const {container} = await renderTab({active: true});
      expect(container).toHaveAttribute('aria-selected', 'true');
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

  it('should call select when button is clicked', async () => {
    const selectFn = vi.fn();
    const {button} = await renderTab({select: selectFn});

    button.click();

    expect(selectFn).toHaveBeenCalledOnce();
  });
});
