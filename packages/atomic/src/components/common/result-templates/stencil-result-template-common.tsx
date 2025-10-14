import {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {h} from '@stencil/core';
import {aggregate, isElementNode, isVisualNode} from '@/src/utils/utils';
import {tableElementTagName} from '../table-element-utils';
import {ItemTarget} from '../layout/display-options';
import {isResultSectionNode} from '../layout/item-layout-sections';

export type TemplateContent = DocumentFragment;

interface ResultTemplateCommonProps {
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

export class ResultTemplateCommon {
  private host: HTMLDivElement;
  public matchConditions: ResultTemplateCondition[] = [];
  private gridCellLinkTarget: ItemTarget = '_self';

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

    if (
      host.parentElement?.attributes.getNamedItem('display')?.value === 'grid'
    ) {
      this.gridCellLinkTarget = host.parentElement?.attributes.getNamedItem(
        'grid-cell-link-target'
      )?.value as ItemTarget;
    }

    const template = host.querySelector<HTMLTemplateElement>(
      'template:not([slot])'
    );
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
        'Result templates should only contain section elements or non-section elements. Future updates could unpredictably affect this result template.',
        host,
        {sectionNodes, otherNodes}
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
      linkContent: this.getLinkTemplateElement(this.host).content!,
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

  getDefaultLinkTemplateElement() {
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `<atomic-result-link>${this.gridCellLinkTarget ? `<a slot="attributes" target="${this.gridCellLinkTarget}"></a>` : ''}</atomic-result-link>`;
    return linkTemplate;
  }

  getLinkTemplateElement(host: HTMLElement) {
    return (
      host.querySelector<HTMLTemplateElement>('template[slot="link"]') ??
      this.getDefaultLinkTemplateElement()
    );
  }
}

function getTemplateElement(host: HTMLElement) {
  return host.querySelector<HTMLTemplateElement>('template:not([slot])')!;
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
