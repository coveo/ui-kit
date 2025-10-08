import {
  type ProductTemplateCondition,
  ProductTemplatesHelpers,
} from '@coveo/headless/commerce';
import {intersection} from '../../../utils/set';
import {isElementNode, isVisualNode} from '../../../utils/utils';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import {isResultSectionNode} from '../layout/item-layout-sections';

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

export function makeMatchConditions(
  mustMatch: Record<string, string[]>,
  mustNotMatch: Record<string, string[]>
): ProductTemplateCondition[] {
  const conditions: ProductTemplateCondition[] = [];
  for (const field in mustMatch) {
    if (mustNotMatch[field]) {
      const mustNotMatchValues = new Set(mustNotMatch[field]);
      const mustMatchValues = new Set(mustMatch[field]);
      const commonValues = intersection(mustNotMatchValues, mustMatchValues);
      if (commonValues.size > 0) {
        console.error(
          `Conflicting match conditions for field ${field}, the template will be ignored.`,
          commonValues
        );
        return [() => false];
      }
    }
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
