import {ResultTemplateCondition, ResultTemplatesHelpers} from '@coveo/headless';

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
