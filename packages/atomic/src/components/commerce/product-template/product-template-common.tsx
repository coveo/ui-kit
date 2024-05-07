import {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesHelpers,
} from '@coveo/headless/commerce';
import {h} from '@stencil/core';
import {aggregate, isElementNode, isVisualNode} from '../../../utils/utils';
import {isResultSectionNode} from '../../common/layout/sections';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';

export type TemplateContent = DocumentFragment;

interface ProductTemplateCommonProps {
  allowEmpty?: boolean;
  host: HTMLDivElement;
  validParents: string[];
  setError: (error: Error) => void;
}

type TemplateNodeType =
  | 'section'
  | 'metadata'
  | 'table-column-definition'
  | 'other';

export function getTemplateNodeType(node: Node): TemplateNodeType {
  if (isResultSectionNode(node)) {
    return 'section';
  }
  if (!isVisualNode(node)) {
    return 'metadata';
  }
  if (
    isElementNode(node) &&
    node.tagName.toLowerCase() === tableElementTagName
  ) {
    return 'table-column-definition';
  }
  return 'other';
}

function groupNodesByType(nodes: NodeList) {
  return aggregate(Array.from(nodes), (node) => getTemplateNodeType(node));
}

export class ProductTemplateCommon {
  private host: HTMLDivElement;
  public matchConditions: ProductTemplateCondition[] = [];

  constructor({
    host,
    setError,
    validParents,
    allowEmpty = false,
  }: ProductTemplateCommonProps) {
    this.host = host;
    this.validateTemplate(host, setError, validParents, allowEmpty);
  }

  validateTemplate(
    host: HTMLDivElement,
    setError: (error: Error) => void,
    validParents: string[],
    allowEmpty = true
  ) {
    const hasValidParent = validParents
      .map((p) => p.toUpperCase())
      .includes(host.parentElement?.nodeName || '');
    const tagName = host.nodeName.toLowerCase();

    if (!hasValidParent) {
      setError(
        new Error(
          `The "${tagName}" component has to be the child of one of the following: ${validParents
            .map((p) => `"${p.toLowerCase()}"`)
            .join(', ')}.`
        )
      );
      return;
    }

    const template = host.querySelector('template');
    if (!template) {
      setError(
        new Error(
          `The "${tagName}" component must contain a "template" element as a child.`
        )
      );
      return;
    }

    if (!allowEmpty && !template.innerHTML.trim()) {
      setError(
        new Error(`The "template" tag inside "${tagName}" cannot be empty.`)
      );
      return;
    }

    if (template.content.querySelector('script')) {
      console.warn(
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the products are rendered.',
        host
      );
    }

    const {section: sectionNodes, other: otherNodes} = groupNodesByType(
      template.content.childNodes
    );
    if (sectionNodes?.length && otherNodes?.length) {
      console.warn(
        'Product templates should only contain section elements or non-section elements. Future updates could unpredictably affect this product template.',
        host,
        {sectionNodes, otherNodes}
      );
    }
  }

  getTemplate(
    conditions: ProductTemplateCondition[],
    error: Error
  ): ProductTemplate<TemplateContent> | null {
    if (error) {
      return null;
    }

    return {
      conditions: conditions.concat(this.matchConditions),
      content: getTemplateElement(this.host).content!,
      priority: 1,
    };
  }

  renderIfError(error: Error) {
    if (error) {
      return (
        <atomic-component-error
          element={this.host}
          error={error}
        ></atomic-component-error>
      );
    }
  }
}

function getTemplateElement(host: HTMLElement) {
  return host.querySelector('template')!;
}
export function makeMatchConditions(
  mustMatch: Record<string, string[]>,
  mustNotMatch: Record<string, string[]>
): ProductTemplateCondition[] {
  const conditions: ProductTemplateCondition[] = [];
  for (const field in mustMatch) {
    conditions.push(
      ProductTemplatesHelpers.fieldMustMatch(field, mustMatch[field])
    );
  }

  for (const field in mustNotMatch) {
    conditions.push(
      ProductTemplatesHelpers.fieldMustNotMatch(field, mustNotMatch[field])
    );
  }
  return conditions;
}

export function makeDefinedConditions(
  ifDefined?: string,
  ifNotDefined?: string
): ProductTemplateCondition[] {
  const conditions: ProductTemplateCondition[] = [];
  if (ifDefined) {
    const fieldNames = ifDefined.split(',');
    conditions.push(ProductTemplatesHelpers.fieldsMustBeDefined(fieldNames));
  }

  if (ifNotDefined) {
    const fieldNames = ifNotDefined.split(',');
    conditions.push(ProductTemplatesHelpers.fieldsMustNotBeDefined(fieldNames));
  }
  return conditions;
}
