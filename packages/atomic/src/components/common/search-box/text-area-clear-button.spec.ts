import {html} from 'lit';
import {createRef, type Ref} from 'lit/directives/ref.js';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderTextAreaClearButton} from './text-area-clear-button';

describe('#renderTextAreaClearButton', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    ref?: Ref<HTMLTextAreaElement>,
    onClick?: () => void
  ) => {
    const element = await renderFunctionFixture(
      html`${renderTextAreaClearButton({
        props: {
          i18n,
          textAreaRef: ref ?? createRef<HTMLTextAreaElement>(),
          onClick: onClick ?? (() => {}),
        },
      })}`
    );
    return {
      element,
      wrapper: element.querySelector('div[part="clear-button-wrapper"]'),
      button: element.querySelector('button[part="clear-button"]'),
      icon: element.querySelector('atomic-icon[part="clear-icon"]'),
    };
  };

  it('should have the "clear-button-wrapper" part on the container', async () => {
    const {wrapper} = await renderComponent();
    expect(wrapper!).toBeInTheDocument();
  });

  it('should have the "clear-button" part on the button', async () => {
    const {button} = await renderComponent();
    expect(button!).toBeInTheDocument();
  });

  it('should have the "btn-text-transparent" class on the button', async () => {
    const {button} = await renderComponent();
    expect(button!).toHaveClass('btn-text-transparent');
  });

  it('should trigger the textAreaRef focus on click', async () => {
    const mockTextAreaRef: Ref<HTMLTextAreaElement> = {
      value: {
        focus: vi.fn(),
      } as unknown as HTMLTextAreaElement,
    };
    const {button} = await renderComponent(mockTextAreaRef);
    await userEvent.click(button!);
    expect(mockTextAreaRef.value?.focus).toHaveBeenCalled();
  });

  it('should trigger the onClick callback on click', async () => {
    const onClick = vi.fn();
    const {button} = await renderComponent(undefined, onClick);
    await userEvent.click(button!);
    expect(onClick).toHaveBeenCalled();
  });

  it('should have aria-label as "Clear" on the button', async () => {
    const {button} = await renderComponent();
    expect(button!).toHaveAttribute('aria-label', 'Clear search-box');
  });

  it('should have the "clear-icon" part on the atomic-icon', async () => {
    const {icon} = await renderComponent();
    expect(icon!).toBeInTheDocument();
  });

  it('should have an svg icon on the atomic-icon', async () => {
    const {icon} = await renderComponent();
    expect(icon!.getAttribute('icon')).toContain('<svg');
  });
});
