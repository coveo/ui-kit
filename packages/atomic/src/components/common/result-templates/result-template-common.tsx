import {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {h} from '@stencil/core';

export type TemplateContent = DocumentFragment;

interface ResultTemplateCommonProps {
  allowEmpty?: boolean;
  host: HTMLDivElement;
  validParents: string[];
  setError: (error: Error) => void;
}

export class ResultTemplateCommon {
  private host: HTMLDivElement;
  public matchConditions: ResultTemplateCondition[] = [];

  constructor({
    host,
    setError,
    validParents,
    allowEmpty = false,
  }: ResultTemplateCommonProps) {
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

    if (!allowEmpty && !template?.innerHTML.trim()) {
      setError(
        new Error(`The "template" tag inside "${tagName}" cannot be empty`)
      );
      return;
    }

    if (template?.content.querySelector('script')) {
      console.warn(
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the results are rendered',
        host
      );
    }
  }

  getTemplate(
    conditions: ResultTemplateCondition[],
    error: Error
  ): ResultTemplate<TemplateContent> | null {
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
