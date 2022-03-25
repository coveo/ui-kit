import {FunctionalComponent, h} from '@stencil/core';

export interface StyleFromTemplateProps {
  host: HTMLElement;
  fallback?: string;
}

export const StyleFromTemplate: FunctionalComponent<StyleFromTemplateProps> = ({
  host,
  fallback,
}) => {
  function isTemplateElement(element: Element): element is HTMLTemplateElement {
    return element instanceof HTMLTemplateElement;
  }

  const styleElement =
    Array.from(host.children)
      .find(isTemplateElement)
      ?.content.querySelector('style') ?? undefined;

  if (!styleElement && !fallback) {
    return null;
  }

  // deepcode ignore ReactSetInnerHtml: inserted in style tag
  return <style innerHTML={styleElement?.innerHTML ?? fallback}></style>;
};
