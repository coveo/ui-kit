import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {errorGuard} from './error-guard';

describe('@errorGuard decorator', () => {
  const renderSpy = vi.fn();
  const initialRenderCalls = 1;
  let element: TestElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  @customElement('test-element')
  class TestElement extends LitElement {
    @state() public error!: Error;

    @errorGuard()
    public render() {
      renderSpy();
      return html`<div>No errors!</div>`;
    }
  }

  const setupElement = async () => {
    element = await fixture<TestElement>(html`<test-element></test-element>`);
  };

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await setupElement();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    renderSpy.mockRestore();
  });

  it('should render the original content when there is no error', async () => {
    expect(element.shadowRoot?.textContent).toContain('No errors!');
    expect(renderSpy).toHaveBeenCalledTimes(initialRenderCalls);

    await element.requestUpdate();
    expect(renderSpy).toHaveBeenCalledTimes(initialRenderCalls + 1);
  });

  it('should not call the original render function', async () => {
    element.error = new Error('Test error');
    await element.updateComplete;
    expect(renderSpy).toHaveBeenCalledTimes(initialRenderCalls);

    await element.requestUpdate();
    expect(renderSpy).toHaveBeenCalledTimes(initialRenderCalls); // should not have been called again
  });

  it('should console log the error message when there is an error', async () => {
    element.error = new Error('Test error');
    await element.updateComplete;

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      new Error('Test error'),
      element
    );
  });

  it('should render the error message when there is an error', async () => {
    element.error = new Error('Test error');
    await element.updateComplete;

    const errorElement = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorElement).not.toBeNull();
  });

  it('should throw an error if used on a property', () => {
    expect(() => {
      // @ts-expect-error - unused class
      class _ {
        // @ts-expect-error - invalid usage
        @errorGuard() myProp?: string;
      }
    }).toThrow('@errorGuard decorator can only be used on render method');
  });

  it('should throw an error if used on a method other than render', () => {
    expect(() => {
      // @ts-expect-error - unused class
      class _ {
        // @ts-expect-error - invalid usage
        @errorGuard()
        public someMethod() {}
      }
    }).toThrow('@errorGuard decorator can only be used on render method');
  });
});
