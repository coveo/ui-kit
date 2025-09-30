import {
  type ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {isElementNode, isVisualNode} from '@/src/utils/utils';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import {isResultSectionNode} from '../layout/sections';

export type TemplateContent = DocumentFragment;

type TemplateNodeType =
  | 'section'
  | 'metadata'
  | 'table-column-definition'
  | 'other';

export function getTemplateNodeType(node: Node): TemplateNodeType {
  if (isResultSectionNode(node)) return 'section';
  if (!isVisualNode(node)) return 'metadata';
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
): ResultTemplateCondition[] {
  const conditions: ResultTemplateCondition[] = [];
  for (const field in mustMatch) {
    conditions.push(
      ResultTemplatesHelpers.fieldMustMatch(field, mustMatch[field])
    );
  }

  for (const field in mustNotMatch) {
    conditions.push(
      ResultTemplatesHelpers.fieldMustNotMatch(field, mustNotMatch[field])
    );
  }
  return conditions;
}

export function makeDefinedConditions(
  ifDefined?: string,
  ifNotDefined?: string
): ResultTemplateCondition[] {
  const conditions: ResultTemplateCondition[] = [];
  if (ifDefined) {
    const fieldNames = ifDefined.split(',');
    conditions.push(ResultTemplatesHelpers.fieldsMustBeDefined(fieldNames));
  }

  if (ifNotDefined) {
    const fieldNames = ifNotDefined.split(',');
    conditions.push(ResultTemplatesHelpers.fieldsMustNotBeDefined(fieldNames));
  }
  return conditions;
}
