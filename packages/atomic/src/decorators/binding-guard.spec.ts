import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {bindingGuard} from './binding-guard';

describe('@bindingGuard decorator', () => {
  let element: TestElement;
  const renderSpy = vi.fn();
  const bindings = {
    engine: buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    }),
  } as Bindings;

  @customElement('test-element')
  class TestElement extends LitElement {
    @state() bindings!: Bindings;
    @bindingGuard()
    public render() {
      renderSpy();
      return html`<div>Content to render when bindings are present</div>`;
    }
  }

  const setupElement = async () => {
    element = document.createElement('test-element') as TestElement;
    document.body.appendChild(element);
    await element.updateComplete;
  };

  const teardownElement = () => {
    document.body.removeChild(element);
  };

  beforeEach(async () => {
    await setupElement();
  });

  afterEach(() => {
    teardownElement();
    renderSpy.mockRestore();
  });

  it('should render the original content when bindings are present', async () => {
    element.bindings = bindings;
    await element.updateComplete;

    expect(element.shadowRoot?.textContent).toContain(
      'Content to render when bindings are present'
    );

    expect(renderSpy).toHaveBeenCalled();
  });

  it('should render nothing when bindings are not present', async () => {
    // @ts-expect-error - testing invalid binding
    element.bindings = undefined as Bindings;
    await element.updateComplete;

    expect(element.shadowRoot?.textContent).toBe('');
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it('should throw an error if used on a property', () => {
    expect(() => {
      // @ts-expect-error - unused class
      class _ {
        // @ts-expect-error - invalid usage
        @bindingGuard() myProp?: string;
      }
    }).toThrow('@bindingGuard decorator can only be used on render method');
  });

  it('should throw an error if used on a method other than render', () => {
    expect(() => {
      // @ts-expect-error - unused class
      class _ {
        // @ts-expect-error - invalid usage
        @bindingGuard()
        public someMethod() {}
      }
    }).toThrow('@bindingGuard decorator can only be used on render method');
  });
});
