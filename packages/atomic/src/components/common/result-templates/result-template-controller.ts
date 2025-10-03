import type {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {aggregate} from '../../../utils/utils';
import type {ItemTarget} from '../layout/display-options';
import {getTemplateNodeType} from './result-template-common';

export type TemplateContent = DocumentFragment;

type ResultTemplateHost = ReactiveControllerHost &
  HTMLElement & {error?: Error};

export class ResultTemplateController implements ReactiveController {
  public matchConditions: ResultTemplateCondition[] = [];
  private gridCellLinkTarget?: ItemTarget;

  private static readonly ERRORS = {
    invalidParent: (tag: string, parents: string[]) =>
      `The "${tag}" component has to be the child of one of the following: ${parents
        .map((p) => `"${p.toLowerCase()}"`)
        .join(', ')}.`,
    missingTemplate: (tag: string) =>
      `The "${tag}" component must contain a "template" element as a child.`,
    emptyTemplate: (tag: string) =>
      `The "template" tag inside "${tag}" cannot be empty.`,
  };

  private static readonly WARNINGS = {
    scriptTag:
      'Any "script" tags inside "template" elements are not supported and will not be executed when the results are rendered.',
    sectionMix:
      'Result templates should only contain section OR non-section elements. Future updates could unpredictably affect this template.',
  };

  constructor(
    private host: ResultTemplateHost,
    private validParents: string[],
    private allowEmpty: boolean = false
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.validateTemplate();
  }

  private setError(error: Error) {
    this.host.error = error;
  }

  private validateTemplate() {
    const tag = this.host.nodeName.toLowerCase();
    const parent = this.parentElement;

    const hasValidParent = this.validParents
      .map((p) => p.toUpperCase())
      .includes(parent?.nodeName || '');
    if (!hasValidParent) {
      this.setError(
        new Error(
          ResultTemplateController.ERRORS.invalidParent(tag, this.validParents)
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
        new Error(ResultTemplateController.ERRORS.missingTemplate(tag))
      );
      return;
    }

    if (!this.allowEmpty && !this.template.innerHTML.trim()) {
      this.setError(
        new Error(ResultTemplateController.ERRORS.emptyTemplate(tag))
      );
      return;
    }

    if (this.template.content.querySelector('script')) {
      console.warn(ResultTemplateController.WARNINGS.scriptTag, this.host);
    }

    const {section, other} = groupNodesByType(this.template.content.childNodes);
    if (section?.length && other?.length) {
      console.warn(ResultTemplateController.WARNINGS.sectionMix, this.host, {
        section,
        other,
      });
    }
  }

  getTemplate(
    conditions: ResultTemplateCondition[]
  ): ResultTemplate<TemplateContent> | null {
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
    linkTemplate.innerHTML = `<atomic-result-link>${
      this.gridCellLinkTarget
        ? `<a slot="attributes" target="${this.gridCellLinkTarget}"></a>`
        : ''
    }</atomic-result-link>`;
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

  private parentAttr(name: string) {
    return this.parentElement?.attributes.getNamedItem(name)?.value;
  }
}

function getTemplateElement(host: HTMLElement) {
  return host.querySelector<HTMLTemplateElement>('template:not([slot])')!;
}

function groupNodesByType(nodes: NodeList) {
  return aggregate(Array.from(nodes), (node) => getTemplateNodeType(node));
}
