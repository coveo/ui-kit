import {intersection} from '@/src/utils/set';

export type TemplateContent = DocumentFragment;

export interface TemplateHelpers<TCondition> {
  fieldMustMatch: (field: string, values: string[]) => TCondition;
  fieldMustNotMatch: (field: string, values: string[]) => TCondition;
  fieldsMustBeDefined: (fieldNames: string[]) => TCondition;
  fieldsMustNotBeDefined: (fieldNames: string[]) => TCondition;
}

export function makeMatchConditions<TCondition>(
  mustMatch: Record<string, string[]>,
  mustNotMatch: Record<string, string[]>,
  helpers: TemplateHelpers<TCondition>
): TCondition[] {
  const conditions: TCondition[] = [];

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
        return [(() => false) as TCondition];
      }
    }
    conditions.push(helpers.fieldMustMatch(field, mustMatch[field]));
  }

  for (const field in mustNotMatch) {
    conditions.push(helpers.fieldMustNotMatch(field, mustNotMatch[field]));
  }

  return conditions;
}

export function makeDefinedConditions<TCondition>(
  ifDefined: string | undefined,
  ifNotDefined: string | undefined,
  helpers: TemplateHelpers<TCondition>
): TCondition[] {
  const conditions: TCondition[] = [];

  if (ifDefined) {
    const fieldNames = ifDefined.split(',');
    conditions.push(helpers.fieldsMustBeDefined(fieldNames));
  }

  if (ifNotDefined) {
    const fieldNames = ifNotDefined.split(',');
    conditions.push(helpers.fieldsMustNotBeDefined(fieldNames));
  }

  return conditions;
}
