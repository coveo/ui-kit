import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {describe, expect, it} from 'vitest';
import {mapAttributesToProp, mapProperty} from './props-utils';

describe('mapAttributesToProp', () => {
  it('should map a simple attribute name (prefix-property) with a single value', () => {
    const map = {};
    mapAttributesToProp(
      'provinces',
      map,
      [{name: 'provinces-canada', value: 'quebec'}],
      true
    );
    expect(map).toEqual({canada: ['quebec']});
  });

  it('should map a simple attribute name (prefix-property) with multiple values', () => {
    const map = {};
    mapAttributesToProp(
      'provinces',
      map,
      [{name: 'provinces-canada', value: 'quebec, ontario'}],
      true
    );
    expect(map).toEqual({canada: ['quebec', 'ontario']});
  });

  it('should map a a prefix with multiple words in kebab case', () => {
    const map = {};
    mapAttributesToProp(
      'topProvinces',
      map,
      [{name: 'top-provinces-canada', value: 'quebec'}],
      true
    );
    expect(map).toEqual({canada: ['quebec']});
  });

  it('should map a a property with multiple words in kebab case', () => {
    const map = {};
    mapAttributesToProp(
      'cities',
      map,
      [{name: 'cities-british-columbia', value: 'vancouver'}],
      true
    );
    expect(map).toEqual({britishColumbia: ['vancouver']});
  });

  it('should properly handle escape symbols', () => {
    const map = {};
    mapAttributesToProp(
      'filters',
      map,
      [
        {
          name: 'filters-category',
          value:
            'Appliances,Clothing\\, Linens \\& more,Something \\\\, Something else',
        },
      ],
      true
    );
    expect(map).toEqual({
      category: [
        'Appliances',
        'Clothing, Linens & more',
        'Something \\',
        'Something else',
      ],
    });
  });
});

describe('mapProperty', () => {
  it('should create a reactive property', () => {
    class TestElement extends LitElement {
      @mapProperty({attributePrefix: 'field'})
      public field!: Record<string, string>;

      render() {
        return html`<div>${JSON.stringify(this.field)}</div>`;
      }
    }

    customElement('test-map-property')(TestElement);

    // Verify the property was created reactively
    const ctor = TestElement as typeof LitElement;
    // biome-ignore lint/suspicious/noExplicitAny: Testing internal Lit property
    const properties = (ctor as any).elementProperties;

    expect(properties).toBeDefined();
    expect(properties.has('field')).toBe(true);
  });

  it('should map attributes to property during initialization', () => {
    class TestElement2 extends LitElement {
      @mapProperty({attributePrefix: 'data'})
      public data!: Record<string, string>;
    }

    customElement('test-map-property-2')(TestElement2);

    const container = document.createElement('div');
    container.innerHTML =
      '<test-map-property-2 data-name="John" data-age="30"></test-map-property-2>';
    // biome-ignore lint/suspicious/noExplicitAny: Testing dynamic property access
    const element = container.firstElementChild as any;

    document.body.appendChild(element);

    expect(element.data).toBeDefined();
    expect(element.data.name).toBe('John');
    expect(element.data.age).toBe('30');

    document.body.removeChild(element);
  });

  it('should trigger re-renders when property is updated', async () => {
    class TestElement3 extends LitElement {
      @mapProperty({attributePrefix: 'field'})
      public field!: Record<string, string>;

      render() {
        return html`<div>${JSON.stringify(this.field)}</div>`;
      }
    }

    customElement('test-map-property-3')(TestElement3);

    // biome-ignore lint/suspicious/noExplicitAny: Testing dynamic property access
    const element = document.createElement('test-map-property-3') as any;
    document.body.appendChild(element);

    await element.updateComplete;

    element.field = {test: 'value'};
    await element.updateComplete;

    const content = element.shadowRoot?.querySelector('div')?.textContent;
    expect(content).toBe('{"test":"value"}');

    document.body.removeChild(element);
  });
});
