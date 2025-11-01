import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {booleanConverter} from './boolean-converter';

describe('booleanConverter', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  @customElement('test-element')
  class TestElement extends LitElement {
    @property({
      converter: booleanConverter,
      type: Boolean,
    })
    value = false;

    render() {
      return html`<div>${this.value}</div>`;
    }
  }

  @customElement('test-element-with-default-true')
  class TestElementWithDefaultTrue extends LitElement {
    @property({
      converter: booleanConverter,
      type: Boolean,
    })
    value = true;

    render() {
      return html`<div>${this.value}</div>`;
    }
  }

  it('should convert "true" to true', async () => {
    await fixture<TestElement>(
      html`<test-element value="true"></test-element>`
    );

    await expect.element(page.getByText('true')).toBeInTheDocument();
  });

  it('should convert "false" to false', async () => {
    await fixture<TestElement>(
      html`<test-element value="false"></test-element>`
    );

    await expect.element(page.getByText('false')).toBeInTheDocument();
  });

  it('should convert "other" to true', async () => {
    await fixture<TestElement>(
      html`<test-element value="other"></test-element>`
    );

    await expect.element(page.getByText('true')).toBeInTheDocument();
  });

  it('an attribute without values should convert to true', async () => {
    await fixture<TestElement>(html`<test-element value></test-element>`);

    await expect.element(page.getByText('true')).toBeInTheDocument();
  });

  it('an omitted attribute should convert to false', async () => {
    await fixture<TestElement>(html`<test-element></test-element>`);

    await expect.element(page.getByText('false')).toBeInTheDocument();
  });

  it('should print a warning when converting "false" to false', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    await fixture<TestElement>(
      html`<test-element value="false"></test-element>`
    );

    await expect.element(page.getByText('false')).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Using `value="false"` for a boolean attribute is not compliant with HTML standards (see https://html.spec.whatwg.org/#boolean-attributes). This behavior will not be supported in Atomic v4. To set a boolean attribute to false, omit the attribute instead.'
    );
  });

  it('an omitted attribute should convert to false when default is false', async () => {
    await fixture<TestElement>(html`<test-element></test-element>`);

    await expect.element(page.getByText('false')).toBeInTheDocument();
  });

  it('an omitted attribute should convert to true when default is true', async () => {
    await fixture<TestElementWithDefaultTrue>(
      html`<test-element-with-default-true></test-element-with-default-true>`
    );

    await expect.element(page.getByText('true')).toBeInTheDocument();
  });
});
