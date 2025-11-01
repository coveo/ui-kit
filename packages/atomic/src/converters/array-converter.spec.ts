import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {arrayConverter} from './array-converter';

describe('arrayConverter', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  @customElement('test-element')
  class TestElement extends LitElement {
    @property({
      converter: arrayConverter,
      type: Array,
    })
    value: string[] = [];

    render() {
      return html`<div>${JSON.stringify(this.value)}</div>`;
    }
  }

  @customElement('test-element-with-default')
  class TestElementWithDefault extends LitElement {
    @property({
      converter: arrayConverter,
      type: Array,
    })
    value: string[] = ['default'];

    render() {
      return html`<div>${JSON.stringify(this.value)}</div>`;
    }
  }

  it('should convert a valid JSON array string to an array', async () => {
    await fixture<TestElement>(
      html`<test-element value='["item1","item2","item3"]'></test-element>`
    );

    await expect
      .element(page.getByText('["item1","item2","item3"]'))
      .toBeInTheDocument();
  });

  it('should convert an empty JSON array to an empty array', async () => {
    await fixture<TestElement>(html`<test-element value="[]"></test-element>`);

    await expect.element(page.getByText('[]')).toBeInTheDocument();
  });

  it('should convert invalid JSON to an empty array', async () => {
    await fixture<TestElement>(
      html`<test-element value="not-json"></test-element>`
    );

    await expect.element(page.getByText('[]')).toBeInTheDocument();
  });

  it('should convert a non-array JSON value to an empty array', async () => {
    await fixture<TestElement>(
      html`<test-element value='{"key":"value"}'></test-element>`
    );

    await expect.element(page.getByText('[]')).toBeInTheDocument();
  });

  it('an omitted attribute should convert to an empty array', async () => {
    await fixture<TestElement>(html`<test-element></test-element>`);

    await expect.element(page.getByText('[]')).toBeInTheDocument();
  });

  it('should print a warning when parsing fails', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    await fixture<TestElement>(
      html`<test-element value="invalid-json"></test-element>`
    );

    await expect.element(page.getByText('[]')).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to parse the array attribute value: invalid-json. Ensure the value is a valid JSON array.'
    );
  });

  it('an omitted attribute should use the default value when provided', async () => {
    await fixture<TestElementWithDefault>(
      html`<test-element-with-default></test-element-with-default>`
    );

    await expect.element(page.getByText('["default"]')).toBeInTheDocument();
  });

  it('should handle arrays with different types of values', async () => {
    await fixture<TestElement>(
      html`<test-element value='["string",123,true,null]'></test-element>`
    );

    await expect
      .element(page.getByText('["string",123,true,null]'))
      .toBeInTheDocument();
  });
});
