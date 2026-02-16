import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createLegacyArrayStringConverter} from './legacy-array-string-converter';

describe('createLegacyArrayStringConverter', () => {
  const _warningCallback = (value: string) => {
    console.warn(
      `Starting from Atomic v4, the "fields-to-include-in-citations" property will only accept an array of strings. Using a comma-separated string value ("${value}") is now deprecated. Please update the value to be a JSON array. For example: fields-to-include-in-citations='["fieldA","fieldB"]'`
    );
  };

  @customElement('test-element')
  class TestElement extends LitElement {
    @property({
      converter: createLegacyArrayStringConverter(_warningCallback),
      type: String,
    })
    value?: string;

    render() {
      return html`
        <div data-testid="value-type">${typeof this.value}</div>
        <div data-testid="is-Array">${Array.isArray(this.value)}</div>
        <div data-testid="output">${JSON.stringify(this.value)}</div>
      `;
    }
  }

  it.each([
    {
      name: 'comma separated list (legacy)',
      template: html`<test-element value="item1,item2,item3"></test-element>`,
    },
    {
      name: 'stringified array (new)',
      template: html`<test-element
        value='["item1","item2","item3"]'
      ></test-element>`,
    },
    {
      name: 'array values directly',
      template: html`<test-element
        .value=${['item1', 'item2', 'item3']}
      ></test-element>`,
    },
  ])('should support $name', async ({template}) => {
    await fixture<TestElement>(template);

    await expect
      .element(page.getByTestId('value-type'))
      .toHaveTextContent('object');
    await expect
      .element(page.getByTestId('is-Array'))
      .toHaveTextContent('true');
    await expect
      .element(page.getByTestId('output'))
      .toHaveTextContent('["item1","item2","item3"]');
  });

  it('should print a warning when using the legacy comma-separated string', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    await fixture<TestElement>(
      html`<test-element value="item1,item2,item3"></test-element>`
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Starting from Atomic v4, the "fields-to-include-in-citations" property will only accept an array of strings. Using a comma-separated string value ("item1,item2,item3") is now deprecated. Please update the value to be a JSON array. For example: fields-to-include-in-citations='["fieldA","fieldB"]'`
    );
  });

  it('should not print a warning when using the new JSON array format', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    await fixture<TestElement>(
      html`<test-element value='["item1","item2","item3"]'></test-element>`
    );

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
