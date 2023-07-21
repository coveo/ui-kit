import {
  ProductRecommendationTemplate,
  ProductRecommendationTemplateCondition,
} from '@coveo/headless/product-listing';
import {h} from '@stencil/core';
import {aggregate, isElementNode, isVisualNode} from '../../../utils/utils';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import {isResultSectionNode} from '../layout/sections';

export type TemplateContent = DocumentFragment;

interface ProductRecommendationTemplateCommonProps {
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

export class ProductRecommendationTemplateCommon {
  private host: HTMLDivElement;
  public matchConditions: ProductRecommendationTemplateCondition[] = [];

  constructor({
    host,
    setError,
    validParents,
    allowEmpty = false,
  }: ProductRecommendationTemplateCommonProps) {
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
          `The "${tagName}" component has to contain a "template" element as a child.`
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
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the results are rendered.',
        host
      );
    }

    const {section: sectionNodes, other: otherNodes} = groupNodesByType(
      template.content.childNodes
    );
    if (sectionNodes?.length && otherNodes?.length) {
      console.warn(
        'Product recommendation templates should only contain section elements or non-section elements. Future updates could unpredictably affect this result template.',
        host,
        {sectionNodes, otherNodes}
      );
    }
  }

  getTemplate(
    conditions: ProductRecommendationTemplateCondition[],
    error: Error
  ): ProductRecommendationTemplate<TemplateContent> | null {
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

// export function makeMatchConditions(
//   mustMatch: Record<string, string[]>,
//   mustNotMatch: Record<string, string[]>
// ): ProductRecommendationTemplateCondition[] {
//   const conditions: ProductRecommendationTemplateCondition[] = [];
//   for (const field in mustMatch) {
//     conditions.push(
//       ProductRecommendationTemplatesHelpers.fieldMustMatch(
//         field,
//         mustMatch[field]
//       )
//     );
//   }

//   for (const field in mustNotMatch) {
//     conditions.push(
//       ProductRecommendationTemplatesHelpers.fieldMustNotMatch(
//         field,
//         mustNotMatch[field]
//       )
//     );
//   }
//   return conditions;
// }

// export function makeDefinedConditions(
//   ifDefined?: string,
//   ifNotDefined?: string
// ): ProductRecommendationTemplateCondition[] {
//   const conditions: ProductRecommendationTemplateCondition[] = [];
//   if (ifDefined) {
//     const fieldNames = ifDefined.split(',');
//     conditions.push(
//       ProductRecommendationTemplatesHelpers.fieldsMustBeDefined(fieldNames)
//     );
//   }

//   if (ifNotDefined) {
//     const fieldNames = ifNotDefined.split(',');
//     conditions.push(
//       ProductRecommendationTemplatesHelpers.fieldsMustNotBeDefined(fieldNames)
//     );
//   }
//   return conditions;
// }
