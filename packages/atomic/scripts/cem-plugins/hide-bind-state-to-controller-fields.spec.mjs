import {describe, expect, it} from 'vitest';
import {hideBindStateToControllerFieldsPlugin} from '../cem-plugin.mjs';
import {analyze, findAttribute, findElement, findMember, litElement} from './testing/analyze.mjs';

const plugins = () => [hideBindStateToControllerFieldsPlugin()];

describe('hideBindStateToControllerFieldsPlugin', () => {
  it('should hide the decorated field and the controller it is bound to', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  public searchBox!: SearchBox;
  @bindStateToController('searchBox') @state() public searchBoxState!: SearchBoxState;
  @property({type: String}) label?: string;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    expect(findMember(element, 'searchBox').privacy).toBe('private');
    expect(findMember(element, 'searchBoxState').privacy).toBe('private');
    expect(findMember(element, 'label').privacy).toBeUndefined();
  });

  it('should remove the attribute of a hidden controller property', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  @property({type: Object}) public facet!: Facet;
  @bindStateToController('facet') @state() public facetState!: FacetState;
  @property({type: String}) label?: string;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    expect(findAttribute(element, 'facet')).toBeUndefined();
    expect(findAttribute(element, 'label')).toBeDefined();
  });

  it('should accept the decorators in either order', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  public pager!: Pager;
  @state() @bindStateToController('pager') public pagerState!: PagerState;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    expect(findMember(element, 'pager').privacy).toBe('private');
    expect(findMember(element, 'pagerState').privacy).toBe('private');
  });

  it('should leave the other fields of a class alone', () => {
    const manifest = analyze(
      {
        'src/x-foo.ts': litElement(
          'x-foo',
          'XFoo',
          `
  public pager!: Pager;
  @bindStateToController('pager') @state() public pagerState!: PagerState;
  @property({type: Number, attribute: 'number-of-pages'}) public numberOfPages = 5;
  public summary!: Summary;
`
        ),
      },
      plugins()
    );

    const element = findElement(manifest, 'x-foo');
    expect(findMember(element, 'numberOfPages').privacy).not.toBe('private');
    expect(findMember(element, 'summary').privacy).toBe('public');
    expect(findAttribute(element, 'number-of-pages')).toBeDefined();
  });
});
