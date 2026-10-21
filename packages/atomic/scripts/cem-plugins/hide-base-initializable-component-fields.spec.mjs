import {describe, expect, it} from 'vitest';
import {hideBaseInitializableComponentFieldsPlugin} from './hide-base-initializable-component-fields.mjs';
import {analyze, findAttribute, findElement, findMember, litElement} from './testing/analyze.mjs';

const plugins = () => [hideBaseInitializableComponentFieldsPlugin()];

describe('hideBaseInitializableComponentFieldsPlugin', () => {
  it('should hide the fields that InitializableComponent requires', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @state() public bindings!: Bindings;
  public initialized = false;
  public unsubscribeLanguage?: () => void;
  @state() public error!: Error;
  @property({type: String}) label?: string;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    for (const name of ['bindings', 'initialized', 'unsubscribeLanguage', 'error']) {
      expect(findMember(element, name).privacy, name).toBe('private');
    }
    expect(findMember(element, 'label').privacy).toBeUndefined();
    expect(findAttribute(element, 'label')).toBeDefined();
  });

  it('should leave a class without those fields alone', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @property({type: String}) label?: string;
  public summary!: Summary;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    expect(findMember(element, 'label').privacy).toBeUndefined();
    expect(findMember(element, 'summary').privacy).toBe('public');
  });

  it('should leave a field backed by an attribute alone, since it is a public input', () => {
    const manifest = analyze(
      {
        'src/x-error.ts': litElement(
          'x-error',
          'XError',
          `
  @property({type: Object}) element!: HTMLElement;
  @property({type: Object}) error!: Error;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-error');
    expect(findMember(element, 'error').privacy).toBeUndefined();
    expect(findAttribute(element, 'error')).toMatchObject({
      fieldName: 'error',
      type: {text: 'Error'},
    });
  });
});
