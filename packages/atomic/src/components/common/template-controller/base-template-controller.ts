import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {isResultSectionNode} from '@/src/components/common/layout/item-layout-sections';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import {tableElementTagName} from '@/src/components/common/table-element-utils';
import {aggregate, isElementNode, isVisualNode} from '@/src/utils/utils';

export type TemplateContent = DocumentFragment;

type BaseTemplateHost = ReactiveControllerHost & HTMLElement & {error?: Error};

interface Template<TCondition> {
  conditions: TCondition[];
  content: TemplateContent;
  linkContent?: TemplateContent;
  priority: number;
}

export abstract class BaseTemplateController<TCondition>
  implements ReactiveController
{
  private static readonly ERRORS = {
    invalidParent: (tagName: string, validParents: string[]) =>
      `The "${tagName}" component has to be the child of one of the following: ${validParents
        .map((p) => `"${p.toLowerCase()}"`)
        .join(', ')}.`,
    missingTemplate: (tagName: string) =>
      `The "${tagName}" component must contain a "template" element as a child.`,
    emptyTemplate: (tagName: string) =>
      `The "template" tag inside "${tagName}" cannot be empty.`,
  };

  private gridCellLinkTarget?: ItemTarget;
  public matchConditions: TCondition[] = [];

  constructor(
    protected host: BaseTemplateHost,
    private validParents: string[],
    private allowEmpty: boolean = false
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.validateTemplate();
  }

  getLinkTemplateElement(host: HTMLElement) {
    return (
      host.querySelector<HTMLTemplateElement>('template[slot="link"]') ??
      this.getDefaultLinkTemplateElement()
    );
  }

  protected abstract getDefaultLinkTemplateElement(): HTMLTemplateElement;

  protected getBaseTemplate(
    conditions: TCondition[]
  ): Template<TCondition> | null {
    if (this.host.error) {
      return null;
    }
    return {
      conditions: conditions.concat(this.matchConditions),
      content: this.getTemplateElement().content!,
      linkContent: this.getLinkTemplateElement(this.host).content!,
      priority: 1,
    };
  }

  protected get currentGridCellLinkTarget() {
    return this.gridCellLinkTarget;
  }

  private setError(error: Error) {
    this.host.error = error;
  }

  private get parentElement() {
    return this.host.parentElement;
  }

  private get template() {
    return this.host.querySelector('template');
  }

  private parentAttr(attribute: string) {
    return this.parentElement?.attributes.getNamedItem(attribute)?.value;
  }

  private validateTemplate() {
    const hasValidParent = this.validParents
      .map((p) => p.toUpperCase())
      .includes(this.parentElement?.nodeName || '');
    const tagName = this.host.nodeName.toLowerCase();

    if (!hasValidParent) {
      this.setError(
        new Error(
          BaseTemplateController.ERRORS.invalidParent(
            tagName,
            this.validParents
          )
        )
      );
      return;
    }

    if (this.parentAttr('display') === 'grid') {
      this.gridCellLinkTarget = this.parentAttr(
        'grid-cell-link-target'
      ) as ItemTarget;
    }

    if (!this.template) {
      this.setError(
        new Error(BaseTemplateController.ERRORS.missingTemplate(tagName))
      );
      return;
    }

    if (!this.allowEmpty && !this.template.innerHTML.trim()) {
      this.setError(
        new Error(BaseTemplateController.ERRORS.emptyTemplate(tagName))
      );
      return;
    }

    const warnings = this.getWarnings();

    if (this.template.content.querySelector('script')) {
      console.warn(warnings.scriptTag, this.host);
    }

    const {section, other} = this.groupNodesByType(
      this.template.content.childNodes
    );

    if (section?.length && other?.length) {
      console.warn(warnings.sectionMix, this.host, {
        section,
        other,
      });
    }
  }

  private getWarnings() {
    return {
      scriptTag:
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the items are rendered.',
      sectionMix:
        'Item templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this item template.',
    };
  }

  private getTemplateElement() {
    return this.host.querySelector<HTMLTemplateElement>(
      'template:not([slot])'
    )!;
  }

  private groupNodesByType(nodes: NodeList) {
    return aggregate(Array.from(nodes), (node) =>
      this.getTemplateNodeType(node)
    );
  }

  private getTemplateNodeType(
    node: Node
  ): 'section' | 'metadata' | 'table-column-definition' | 'other' {
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
}
