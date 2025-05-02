import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {createRef, Ref} from 'lit/directives/ref.js';
import {vi, expect, describe, beforeAll, it} from 'vitest';
import {renderTextAreaClearButton} from './text-area-clear-button';

describe('#renderTextAreaClearButton', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = (ref?: Ref<HTMLTextAreaElement>) => {
    return renderFunctionFixture(
      html`${renderTextAreaClearButton({
        props: {
          i18n,
          textAreaRef: ref ?? createRef<HTMLTextAreaElement>(),
        },
      })}`
    );
  };

  it('should have the "clear-button-wrapper" part on the container', async () => {
    const element = await renderComponent();
    const wrapper = element.querySelector('div[part="clear-button-wrapper"]');
    expect(wrapper!).toBeInTheDocument();
  });

  it('should have the "clear-button" part on the button', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button[part="clear-button"]');
    expect(button!).toBeInTheDocument();
  });

  it('should have the "btn-text-transparent" class on the button', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button[part="clear-button"]');

    expect(button!).toHaveClass('btn-text-transparent');
  });

  it('should trigger the textAreaRef focus on click', async () => {
    const mockTextAreaRef: Ref<HTMLTextAreaElement> = {
      value: {
        focus: vi.fn(),
      } as unknown as HTMLTextAreaElement,
    };
    const element = await renderComponent(mockTextAreaRef);
    const button = element.querySelector('button[part="clear-button"]');

    await userEvent.click(button!);

    expect(mockTextAreaRef.value?.focus).toHaveBeenCalled();
  });

  it('should have aria-label as "Clear" on the button', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button[part="clear-button"]');
    expect(button!).toHaveAttribute('aria-label', 'Clear');
  });

  it('should have the "clear-icon" part on the atomic-icon', async () => {
    const element = await renderComponent();
    const icon = element.querySelector('atomic-icon[part="clear-icon"]');
    expect(icon!).toBeInTheDocument();
  });

  it('should have an svg icon on the atomic-icon', async () => {
    const element = await renderComponent();
    const icon = element.querySelector('atomic-icon[part="clear-icon"]');
    expect(icon!.getAttribute('icon')).toContain('<svg');
  });
});
