import type {VNode} from '@stencil/core';
import type {i18n} from 'i18next';
import {html, type TemplateResult} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CloseIcon from '../../../images/close.svg';
import type {Breadcrumb} from './breadcrumb-types';
import {getFirstBreadcrumbValue} from './breadcrumb-utils';

export interface BreadcrumbContentProps {
  pathLimit: number;
  isCollapsed: boolean;
  i18n: i18n;
  breadcrumb: Breadcrumb;
}

/**
 * Checks if a value is a Stencil VNode
 */
function isVNode(value: unknown): value is VNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    ('$tag$' in value || '$text$' in value || '$children$' in value)
  );
}

/**
 * Recursively renders a Stencil VNode to a DOM container.
 * Based on the stencil-vnode-renderer utility but simplified for this use case.
 */
async function renderVNodeToDOM(
  vnode: VNode | VNode[],
  container: HTMLElement
): Promise<void> {
  if (!vnode) {
    return;
  }

  if (Array.isArray(vnode)) {
    for (const child of vnode) {
      await renderVNodeToDOM(child, container);
    }
    return;
  }

  const doc = container.ownerDocument;

  // Handle text nodes
  if (vnode.$text$) {
    const textNode = doc.createTextNode(vnode.$text$);
    container.appendChild(textNode);
    return;
  }

  const renderChildren = async (container: HTMLElement) => {
    if (vnode.$children$) {
      for (const child of vnode.$children$) {
        if (child) {
          await renderVNodeToDOM(child as VNode, container);
        }
      }
    }
  };

  // Handle fragments (no $tag$, just render children directly)
  if (!vnode.$tag$) {
    await renderChildren(container);
    return;
  }

  // Convert VNode attributes to element attributes
  const element = doc.createElement(vnode.$tag$ as string);

  if (vnode.$attrs$) {
    Object.entries(vnode.$attrs$).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value as string;
      } else if (key === 'part') {
        element.setAttribute('part', value as string);
      } else if (key === 'role') {
        element.setAttribute('role', value as string);
      } else if (key === 'aria-label') {
        element.setAttribute('aria-label', value as string);
      } else if (
        key === 'style' &&
        typeof value === 'object' &&
        value !== null
      ) {
        Object.entries(value).forEach(([styleProp, styleValue]) => {
          element.style.setProperty(styleProp, String(styleValue));
        });
      } else if (typeof value === 'boolean') {
        if (value) {
          element.setAttribute(key, '');
        }
      } else if (value !== undefined && value !== null) {
        element.setAttribute(key, String(value));
      }
    });
  }

  await renderChildren(element);
  container.appendChild(element);
}

export const renderBreadcrumbContent: FunctionalComponent<
  BreadcrumbContentProps
> = ({props}) => {
  const value = getFirstBreadcrumbValue(props.breadcrumb, props.pathLimit);

  const isExclusion = props.breadcrumb.state === 'excluded';
  const isSelected = props.breadcrumb.state === 'selected';
  const isIdle = props.breadcrumb.state === 'idle';

  const labelClass = tw({
    'max-w-[30ch] truncate': true,
    'group-hover:text-error group-focus-visible:text-error': isExclusion,
    'group-hover:text-primary group-focus-visible:text-primary': !isExclusion,
    idle: isIdle,
    selected: isSelected,
    excluded: isExclusion,
  });

  const valueClass = tw({
    'ml-1': true,
    'max-w-[30ch] truncate': !props.breadcrumb.content,
    idle: isIdle && !props.breadcrumb.content,
    selected: isSelected && !props.breadcrumb.content,
    excluded: isExclusion && !props.breadcrumb.content,
  });

  // Handle Stencil VNode content by converting it to HTML
  let breadcrumbContent: string | TemplateResult = value;
  if (props.breadcrumb.content) {
    if (isVNode(props.breadcrumb.content)) {
      // Convert VNode to HTML asynchronously - this will be handled synchronously in practice
      // because the VNode is already resolved
      const container = document.createElement('div');
      renderVNodeToDOM(props.breadcrumb.content, container);
      breadcrumbContent = container.innerHTML;
    } else {
      // If it's already a TemplateResult or other renderable content, use it directly
      breadcrumbContent = props.breadcrumb.content as TemplateResult;
    }
  }

  return html`<span part="breadcrumb-label" class=${multiClassMap(labelClass)}>
      ${props.i18n.t('with-colon', {
        text: props.breadcrumb.label,
        interpolation: {escapeValue: false},
      })}
    </span>
    <span part="breadcrumb-value" class=${multiClassMap(valueClass)}>
      ${
        typeof breadcrumbContent === 'string'
          ? unsafeHTML(breadcrumbContent)
          : breadcrumbContent
      }
    </span>
    <atomic-icon
      part="breadcrumb-clear"
      class="mt-px ml-2 h-2.5 w-2.5"
      icon=${CloseIcon}
    >
    </atomic-icon>`;
};
