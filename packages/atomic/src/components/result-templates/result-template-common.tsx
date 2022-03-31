import {h} from '@stencil/core';
import {ResultTemplate, ResultTemplatesHelpers} from '@coveo/headless';
import {AtomicResultTemplate} from '../atomic-result-template/atomic-result-template';
import {AtomicResultChildrenTemplate} from '../atomic-result-children-template/atomic-result-children-template';

export type TemplateContent = DocumentFragment;

// TODO: once I remove the `this` param I expect the wrong path in components.d.s to disappear
type TemplateComponent = AtomicResultTemplate | AtomicResultChildrenTemplate;

export function validateTemplate(
  this: TemplateComponent,
  validParents: string[],
  allowEmpty = true
) {
  const hasValidParent = validParents
    .map((p) => p.toUpperCase())
    .includes(this.host.parentElement?.nodeName || '');
  const tagName = this.host.nodeName.toLowerCase();

  if (!hasValidParent) {
    this.error = new Error(
      `The "${tagName}" component has to be the child of one of the following: ${validParents
        .map((p) => `"${p.toLowerCase()}"`)
        .join(', ')}.`
    );
    return;
  }

  const template = this.host.querySelector('template');
  if (!template) {
    this.error = new Error(
      `The "${tagName}" component has to contain a "template" element as a child.`
    );
    return;
  }

  if (!allowEmpty && !template?.innerHTML.trim()) {
    this.error = new Error(
      `The "template" tag inside "${tagName}" cannot be empty`
    );
    return;
  }

  if (template?.content.querySelector('script')) {
    console.warn(
      'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the results are rendered',
      this.host
    );
  }
}

export function addMatchConditions(this: TemplateComponent) {
  for (const field in this.mustMatch) {
    this.matchConditions.push(
      ResultTemplatesHelpers.fieldMustMatch(field, this.mustMatch[field])
    );
  }

  for (const field in this.mustNotMatch) {
    this.matchConditions.push(
      ResultTemplatesHelpers.fieldMustNotMatch(field, this.mustNotMatch[field])
    );
  }
}

function getTemplateElement(host: HTMLElement) {
  return host.querySelector('template')!;
}

export function getTemplate(
  this: TemplateComponent
): ResultTemplate<TemplateContent> | null {
  if (this.error) {
    return null;
  }

  return {
    conditions: this.conditions.concat(this.matchConditions),
    content: getTemplateElement(this.host).content!,
    priority: 1,
  };
}

export function renderIfError(this: TemplateComponent) {
  if (this.error) {
    return (
      <atomic-component-error
        element={this.host}
        error={this.error}
      ></atomic-component-error>
    );
  }
}
