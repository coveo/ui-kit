import {html, type TemplateResult} from 'lit';
import {Directive, directive, type PartInfo, PartType} from 'lit/directive.js';

export interface HierarchicalPathProps {
  path: string[];
  separator?: string;
  ellipsis?: string;
  maxLength?: number;
  emptyPathContent?: TemplateResult | string;
  separatorClass?: string;
  itemClass?: string;
  ellipsisClass?: string;
}

class HierarchicalPathDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.CHILD) {
      throw new Error('hierarchicalPath can only be used in child bindings');
    }
  }

  render(props: HierarchicalPathProps) {
    const {
      path,
      separator = '/',
      ellipsis = '...',
      maxLength = 3,
      emptyPathContent = '',
      separatorClass = 'mx-0.5',
      itemClass = 'max-w-max flex-1 truncate',
      ellipsisClass = '',
    } = props;

    if (!path.length) {
      return emptyPathContent;
    }

    const ellipsedPath = this.getEllipsedPath(path, maxLength, ellipsis);

    return ellipsedPath.map(
      (value, index) => html`
        ${
          index > 0
            ? html`<span class=${separatorClass}>${separator}</span>`
            : ''
        }
        <span class=${value === ellipsis ? ellipsisClass : itemClass}>
          ${value}
        </span>
      `
    );
  }

  private getEllipsedPath(
    path: string[],
    maxLength: number,
    ellipsis: string
  ): string[] {
    if (path.length <= maxLength) {
      return path;
    }

    // Special case: if maxLength is 1, just return the first item
    if (maxLength === 1) {
      return [path[0]];
    }

    const firstPart = path.slice(0, 1);
    const lastParts = path.slice(-maxLength + 1);
    return firstPart.concat(ellipsis, ...lastParts);
  }
}

export const hierarchicalPath = directive(HierarchicalPathDirective);
