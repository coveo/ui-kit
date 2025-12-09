import type {VNode} from '@stencil/core';

/**
 * Renders a Stencil VNode to DOM for testing functional components.
 *
 * **Why this exists:**
 * Stencil's internal `renderVdom` function (from `@stencil/core/internal/client`) is tightly
 * coupled to the component lifecycle and requires a `hostRef` with component metadata. It's
 * designed for rendering full Stencil components, not standalone functional component VNodes.
 *
 * This utility provides a lightweight VNode-to-DOM renderer specifically for testing functional
 * components that return VNodes. It handles the common VNode features needed for most tests:
 * text nodes, elements, attributes, children, fragments, and ref callbacks.
 *
 * **Limitations:**
 * - Only handles event listeners attached via on* props (e.g., onClick, onChange).
 * - Does not handle custom event dispatching, event modifiers, or capture phase listeners.
 * - Does not handle property vs attribute distinction (uses setAttribute)
 * - Does not handle slot projection or shadow DOM
 * - Does not handle all VNode edge cases that Stencil's internal renderer handles
 *
 * This takes the JSX output from a Stencil functional component and renders it in the DOM.
 *
 * @param vnode - The VNode or VNode[] returned by a Stencil functional component
 * @param container - The container element to render the VNode into
 * @returns The created element (not the container). If operating on a fragment or text node, returns null.
 *
 * @example
 * ```typescript
 * const container = document.createElement('div');
 * document.body.appendChild(container);
 *
 * const vnode = MyStencilComponent({ prop: 'value' }, [], {});
 * await renderStencilVNode(vnode, container);
 * ```
 */
export async function renderStencilVNode(
  vnode: VNode | VNode[],
  container: HTMLElement
): Promise<void> {
  if (!vnode) {
    return;
  }

  // Handle arrays of children (common when components return fragments)
  if (Array.isArray(vnode)) {
    for (const child of vnode) {
      await renderStencilVNode(child, container);
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
          await renderStencilVNode(child as VNode, container);
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

  let refCallback: ((el: Element) => void | Promise<void>) | undefined;

  if (vnode.$attrs$) {
    Object.entries(vnode.$attrs$).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value as string;
      } else if (key === 'ref') {
        refCallback = value as (el: Element) => void | Promise<void>;
      } else if (key === 'htmlFor') {
        element.setAttribute('for', String(value));
      } else if (
        key.startsWith('on') &&
        typeof value === 'function' &&
        key.length > 2
      ) {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value as EventListener);
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

  // Call ref callback after element is in DOM
  if (refCallback) {
    await refCallback(element);
  }

  return;
}
