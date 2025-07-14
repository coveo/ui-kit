import type {
  ProductTemplate,
  ProductTemplateCondition,
} from '@coveo/headless/commerce';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {aggregate} from '../../../utils/utils';
import type {ItemTarget} from '../../common/layout/display-options';
import {getTemplateNodeType} from './product-template-common';

export type TemplateContent = DocumentFragment;

type ProductTemplateHost = ReactiveControllerHost &
  HTMLElement & {error: Error};

export class ProductTemplateController implements ReactiveController {
  public matchConditions: ProductTemplateCondition[] = [];
  private gridCellLinkTarget?: ItemTarget;

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

  private static readonly WARNINGS = {
    scriptTag:
      'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the products are rendered.',
    sectionMix:
      'Product templates should only contain section elements or non-section elements. Future updates could unpredictably affect this product template.',
  };

  constructor(
    private host: ProductTemplateHost,
    private validParents: string[],
    private allowEmpty: boolean = false
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.validateTemplate();
  }

  setError(error: Error) {
    this.host.error = error;
  }

  validateTemplate() {
    const hasValidParent = this.validParents
      .map((p) => p.toUpperCase())
      .includes(this.parentElement?.nodeName || '');
    const tagName = this.host.nodeName.toLowerCase();

    if (!hasValidParent) {
      this.setError(
        new Error(
          ProductTemplateController.ERRORS.invalidParent(
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
        new Error(ProductTemplateController.ERRORS.missingTemplate(tagName))
      );
      return;
    }

    if (!this.allowEmpty && !this.template.innerHTML.trim()) {
      this.setError(
        new Error(ProductTemplateController.ERRORS.emptyTemplate(tagName))
      );
      return;
    }

    if (this.template.content.querySelector('script')) {
      console.warn(ProductTemplateController.WARNINGS.scriptTag, this.host);
    }

    const {section, other} = groupNodesByType(this.template.content.childNodes);

    if (section?.length && other?.length) {
      console.warn(ProductTemplateController.WARNINGS.sectionMix, this.host, {
        section,
        other,
      });
    }
  }

  getTemplate(
    conditions: ProductTemplateCondition[]
  ): ProductTemplate<TemplateContent> | null {
    if (this.host.error) {
      return null;
    }
    return {
      conditions: conditions.concat(this.matchConditions),
      content: getTemplateElement(this.host).content!,
      linkContent: this.getLinkTemplateElement(this.host).content!,
      priority: 1,
    };
  }

  getDefaultLinkTemplateElement() {
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `<atomic-product-link>${this.gridCellLinkTarget ? `<a slot="attributes" target="${this.gridCellLinkTarget}"></a>` : ''}</atomic-product-link>`;
    return linkTemplate;
  }

  getLinkTemplateElement(host: HTMLElement) {
    return (
      host.querySelector<HTMLTemplateElement>('template[slot="link"]') ??
      this.getDefaultLinkTemplateElement()
    );
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
}

function getTemplateElement(host: HTMLElement) {
  return host.querySelector<HTMLTemplateElement>('template:not([slot])')!;
}

function groupNodesByType(nodes: NodeList) {
  return aggregate(Array.from(nodes), (node) => getTemplateNodeType(node));
}
