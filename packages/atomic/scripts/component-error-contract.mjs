import {readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import ts from 'typescript';

/*
 * Static check of the component error contract of ADR 0002, run by `component-error-contract.spec.mjs`.
 *
 * It reads source code, so it only sees what the source names directly. It does not resolve:
 * - aliased imports: decorators, controllers and mixins are matched by name, so `bindings as withBindings` is missed;
 * - base classes: only the members and mixin calls of the custom element class itself are scanned;
 * - helpers that write `host.error` for a component, unless they are listed in `ERROR_WRITING_CONTROLLERS`.
 * None of these patterns exists in `src/components`. Extend the check if one appears.
 */

/**
 * Components with `@bindings()` that render before their bindings arrive, so they take `@errorGuard()` without
 * `@bindingGuard()`. See ADR 0002, "Guard order".
 */
export const RENDERS_BEFORE_BINDINGS = new Set([
  'atomic-field-condition',
  'atomic-html',
  'atomic-insight-tabs',
  'atomic-ipx-button',
  'atomic-ipx-tab',
  'atomic-ipx-tabs',
  'atomic-modal',
  'atomic-product-field-condition',
  'atomic-result-icon',
]);

/**
 * Light DOM components whose parent renders no `<slot>`, so an error box on them would never show. Their parent
 * displays their error instead, so they declare `error` without `@errorGuard()`. See ADR 0002, step 6.
 */
export const DISPLAYED_BY_PARENT = new Map([['atomic-timeframe', 'TimeframeFacetCommon']]);

const ERROR_WRITING_CONTROLLERS = new Set([
  'ValidatePropsController',
  'ItemContextController',
  'FoldedItemListContextController',
  'ResultTemplateController',
  'RecsResultTemplateController',
  'ProductTemplateController',
  'createProductContextController',
  'createInteractiveProductContextController',
  'createResultContextController',
  'createInteractiveResultContextController',
  'TimeframeFacetCommon',
]);

const ERROR_WRITING_MIXINS = new Set(['InitializeBindingsMixin']);

function decoratorName(decorator) {
  const expression = ts.isCallExpression(decorator.expression)
    ? decorator.expression.expression
    : decorator.expression;
  return ts.isIdentifier(expression) ? expression.text : expression.getText();
}

function decoratorsOf(node) {
  return (ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []).map(decoratorName);
}

function calleeName(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text;
  }
  return undefined;
}

function isThisErrorWrite(node) {
  return (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
    node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
    ts.isPropertyAccessExpression(node.left) &&
    node.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
    node.left.name.text === 'error'
  );
}

function errorSourcesOf(classNode) {
  const sources = new Set();
  if (decoratorsOf(classNode).includes('bindings')) {
    sources.add('@bindings()');
  }
  const visit = (node) => {
    if (ts.isNewExpression(node) || ts.isCallExpression(node)) {
      const name = calleeName(node.expression);
      if (name && ERROR_WRITING_CONTROLLERS.has(name)) {
        sources.add(name);
      }
      if (name && ERROR_WRITING_MIXINS.has(name)) {
        sources.add(name);
      }
    }
    if (isThisErrorWrite(node)) {
      sources.add('a write to this.error');
    }
    ts.forEachChild(node, visit);
  };
  for (const clause of classNode.heritageClauses ?? []) {
    visit(clause);
  }
  for (const member of classNode.members) {
    visit(member);
  }
  return [...sources];
}

function isOptionalErrorState(member) {
  return (
    ts.isPropertyDeclaration(member) &&
    member.name.getText() === 'error' &&
    member.questionToken !== undefined &&
    member.type?.getText() === 'Error' &&
    decoratorsOf(member).includes('state') &&
    (ts.getModifiers(member) ?? []).some(
      (modifier) => modifier.kind === ts.SyntaxKind.PublicKeyword
    )
  );
}

function tagNameOf(classNode) {
  for (const decorator of ts.getDecorators(classNode) ?? []) {
    const call = decorator.expression;
    if (
      ts.isCallExpression(call) &&
      calleeName(call.expression) === 'customElement' &&
      call.arguments[0] &&
      ts.isStringLiteralLike(call.arguments[0])
    ) {
      return call.arguments[0].text;
    }
  }
  return undefined;
}

/**
 * Describes each custom element class of a source file: what can write its `error`, whether it declares it, and the decorators on its `render()`.
 * @param {string} fileName
 * @param {string} source
 */
export function describeComponents(fileName, source) {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const components = [];
  const visit = (node) => {
    if (ts.isClassDeclaration(node)) {
      const tagName = tagNameOf(node);
      if (tagName) {
        const render = node.members.find(
          (member) => ts.isMethodDeclaration(member) && member.name.getText() === 'render'
        );
        components.push({
          tagName,
          fileName,
          errorSources: errorSourcesOf(node),
          declaresError: node.members.some(isOptionalErrorState),
          renderDecorators: render ? decoratorsOf(render) : [],
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return components;
}

/**
 * Lists the ways a component breaks the error contract of ADR 0002.
 * @param {ReturnType<typeof describeComponents>[number]} component
 * @param {{rendersBeforeBindings?: Set<string>, displayedByParent?: Map<string, string>}} [exceptions]
 */
export function contractViolations(
  component,
  {rendersBeforeBindings = RENDERS_BEFORE_BINDINGS, displayedByParent = DISPLAYED_BY_PARENT} = {}
) {
  const {tagName, errorSources, declaresError, renderDecorators} = component;
  const violations = [];
  const bindingGuardIndex = renderDecorators.indexOf('bindingGuard');
  const errorGuardIndex = renderDecorators.indexOf('errorGuard');
  const canReceiveError = errorSources.length > 0;
  const via = errorSources.join(', ');

  if (canReceiveError && !declaresError) {
    violations.push(
      `${tagName}: can receive \`error\` (${via}) but does not declare \`@state() public error?: Error\`.`
    );
  }
  if (!canReceiveError && declaresError) {
    violations.push(`${tagName}: declares \`error\`, but nothing can set it.`);
  }
  if (canReceiveError && errorGuardIndex === -1 && !displayedByParent.has(tagName)) {
    violations.push(
      `${tagName}: can receive \`error\` (${via}) but render() has no @errorGuard().`
    );
  }
  if (displayedByParent.has(tagName) && errorGuardIndex !== -1) {
    violations.push(
      `${tagName}: its parent displays its error (${displayedByParent.get(tagName)}), so render() takes no @errorGuard().`
    );
  }
  if (!canReceiveError && errorGuardIndex !== -1) {
    violations.push(`${tagName}: nothing can set \`error\`, so render() takes no @errorGuard().`);
  }
  if (
    bindingGuardIndex !== -1 &&
    errorGuardIndex !== -1 &&
    bindingGuardIndex !== errorGuardIndex - 1
  ) {
    violations.push(
      `${tagName}: @bindingGuard() must be directly above @errorGuard() on render().`
    );
  }
  if (errorSources.includes('@bindings()')) {
    const listed = rendersBeforeBindings.has(tagName);
    if (bindingGuardIndex === -1 && !listed) {
      violations.push(
        `${tagName}: uses @bindings() but render() has no @bindingGuard(). Add it, or list the component among those that render before their bindings.`
      );
    }
    if (bindingGuardIndex !== -1 && listed) {
      violations.push(
        `${tagName}: is listed among the components that render before their bindings, but render() has @bindingGuard().`
      );
    }
  }
  return violations;
}

function* componentFiles(directory) {
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* componentFiles(path);
    } else if (
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.d.ts') &&
      !entry.name.endsWith('.stories.ts')
    ) {
      yield path;
    }
  }
}

/**
 * Describes every custom element under a directory.
 * @param {string} directory
 */
export function describeAllComponents(directory) {
  return [...componentFiles(directory)].flatMap((path) =>
    describeComponents(relative(directory, path), readFileSync(path, 'utf8'))
  );
}
