import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderModalBody} from './modal-body';

describe('#renderModalBody', () => {
  const formId = 'test-form-id';
  const onSubmit = vi.fn((e: Event) => e.preventDefault());

  const renderComponent = async () => {
    return await renderFunctionFixture(
      html`${renderModalBody({
        props: {formId, onSubmit},
      })(html`<div>Child content</div>`)}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render form element with correct attributes', async () => {
    const element = await renderComponent();
    const form = element.querySelector('form');

    expect(form).not.toBeNull();
    expect(form?.getAttribute('id')).toBe(formId);
    expect(form?.getAttribute('slot')).toBe('body');
    expect(form?.part).toContain('form');
  });

  it('should render children inside form', async () => {
    const element = await renderComponent();
    const form = element.querySelector('form');

    expect(form).toHaveTextContent('Child content');
  });

  it('should call onSubmit when form is submitted', async () => {
    const element = await renderComponent();
    const form = element.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit'));

    expect(onSubmit).toHaveBeenCalled();
  });
});
