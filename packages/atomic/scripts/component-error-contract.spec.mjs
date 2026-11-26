import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import handlebars from 'handlebars';
import {describe, expect, it} from 'vitest';
import {
  contractViolations,
  DISPLAYED_BY_PARENT,
  describeAllComponents,
  describeComponents,
  RENDERS_BEFORE_BINDINGS,
} from './component-error-contract.mjs';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const componentsDirectory = join(packageRoot, 'src', 'components');

const violationsOf = (components, exceptions) =>
  components.flatMap((component) => contractViolations(component, exceptions));

describe('component error contract (ADR 0002)', () => {
  // Parsing every component takes a few seconds, more than the default timeout on a busy runner.
  it('should hold every component under src/components to the contract', () => {
    const components = describeAllComponents(componentsDirectory);

    expect(components.length).toBeGreaterThan(150);
    expect(
      violationsOf(components),
      'See packages/atomic/docs/adr/0002-display-component-errors-through-explicit-guards-in-one-fixed-order.md'
    ).toEqual([]);
  }, 30_000);

  it('should list only existing components as exceptions', () => {
    const tagNames = new Set(
      describeAllComponents(componentsDirectory).map(({tagName}) => tagName)
    );

    expect(
      [...RENDERS_BEFORE_BINDINGS, ...DISPLAYED_BY_PARENT.keys()].filter(
        (tagName) => !tagNames.has(tagName)
      )
    ).toEqual([]);
  }, 30_000);

  it('should hold a component generated from the template to the contract', () => {
    const template = readFileSync(
      join(packageRoot, 'scripts', 'generate-component-templates', 'component.ts.hbs'),
      'utf8'
    );
    const source = handlebars.compile(template)({
      name: 'atomic-generated',
      namePascalCase: 'AtomicGenerated',
    });

    const components = describeComponents('atomic-generated.ts', source);

    expect(components.map(({tagName}) => tagName)).toEqual(['atomic-generated']);
    expect(violationsOf(components)).toEqual([]);
  });

  describe('#contractViolations', () => {
    const component = ({
      classDecorators = '@bindings()',
      declaration = '@state() public error?: Error;',
      members = '',
      guards = '@bindingGuard()\n@errorGuard()',
    } = {}) => `
      @customElement('atomic-probe')
      ${classDecorators}
      export class AtomicProbe extends LitElement {
        ${declaration}
        ${members}
        ${guards}
        render() {}
      }`;
    const exceptions = {
      rendersBeforeBindings: new Set(['atomic-early']),
      displayedByParent: new Map([['atomic-probe-child', 'the parent']]),
    };
    const violations = (source) => violationsOf(describeComponents('probe.ts', source), exceptions);

    it.each([
      {case: 'a compliant component with bindings', source: component(), expected: []},
      {
        case: 'a compliant component without bindings',
        source: component({
          classDecorators: '',
          members:
            'constructor() { super(); new ValidatePropsController(this, () => ({}), schema); }',
          guards: '@errorGuard()',
        }),
        expected: [],
      },
      {
        case: 'a component that cannot receive an error',
        source: component({classDecorators: '', declaration: '', guards: ''}),
        expected: [],
      },
      {
        case: 'swapped guards',
        source: component({guards: '@errorGuard()\n@bindingGuard()'}),
        expected: [
          'atomic-probe: @bindingGuard() must be directly above @errorGuard() on render().',
        ],
      },
      {
        case: 'a missing @errorGuard()',
        source: component({guards: '@bindingGuard()'}),
        expected: [
          'atomic-probe: can receive `error` (@bindings()) but render() has no @errorGuard().',
        ],
      },
      {
        case: 'a missing declaration',
        source: component({
          classDecorators: '',
          declaration: '',
          members: 'fail() { this.error = new Error(); }',
          guards: '@errorGuard()',
        }),
        expected: [
          'atomic-probe: can receive `error` (this.error =) but does not declare `@state() public error?: Error`.',
        ],
      },
      {
        case: 'a declaration without @state()',
        source: component({declaration: 'public error?: Error;'}),
        expected: [
          'atomic-probe: can receive `error` (@bindings()) but does not declare `@state() public error?: Error`.',
        ],
      },
      {
        case: 'a guard nothing can trigger',
        source: component({classDecorators: '', guards: '@errorGuard()'}),
        expected: [
          'atomic-probe: declares `error`, but nothing can set it.',
          'atomic-probe: nothing can set `error`, so render() takes no @errorGuard().',
        ],
      },
      {
        case: 'a missing @bindingGuard() on a component not listed as rendering before its bindings',
        source: component({guards: '@errorGuard()'}),
        expected: [
          'atomic-probe: uses @bindings() but render() has no @bindingGuard(). Add it, or list the component among those that render before their bindings.',
        ],
      },
      {
        case: 'a @bindingGuard() on a component listed as rendering before its bindings',
        source: component().replace('atomic-probe', 'atomic-early'),
        expected: [
          'atomic-early: is listed among the components that render before their bindings, but render() has @bindingGuard().',
        ],
      },
      {
        case: 'an @errorGuard() on a component whose parent displays its error',
        source: component({guards: '@errorGuard()', classDecorators: ''})
          .replace('atomic-probe', 'atomic-probe-child')
          .replace(
            'render() {}',
            'render() {}\nconstructor() { super(); new ValidatePropsController(this, () => ({}), schema); }'
          ),
        expected: [
          'atomic-probe-child: its parent displays its error (the parent), so render() takes no @errorGuard().',
        ],
      },
    ])('should report $case', ({source, expected}) => {
      expect(violations(source)).toEqual(expected);
    });
  });
});
