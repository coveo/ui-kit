export interface HostedPage {
  /**
   * The unique identifier of the hosted page.
   */
  id: string;
  /**
   * A short descriptive name to help manage hosted pages.
   */
  name: string;
  /**
   * The HTML markup of the hosted page.
   */
  html: string;
  /**
   * The JavaScript resources appended to the header of a specific hosted page in the target Coveo Cloud organization.
   */
  javascript?: HostedPageJavascriptFile[];
  /**
   * The CSS resources appended in the header, pertaining to a specific hosted page in the target Coveo Cloud organization.
   */
  css?: HostedPageCSS[];
  /**
   * The creation timestamp. (ISO 8601)
   */
  created?: string;

  /**
   * The [principal](https://en.wikipedia.org/wiki/Principal_(computer_security)) that created the hosted search page.
   */
  createdBy?: string;

  /**
   * The last update timestamp. (ISO 8601)
   */
  updated?: string;

  /**
   * The principal that last updated the hosted search page.
   */
  updatedBy?: string;
}

export type HostedPageType = 'legacy' | 'page' | 'custom';

export type HostedPageCSS = HostedPageCssInlineFile | HostedPageCssUrlFile;

export interface HostedPageCssUrlFile {
  /**
   * The URL of CSS stylesheet.
   */
  url: string;
}

export interface HostedPageCssInlineFile {
  /**
   * The content of the header `style` tag.
   */
  inlineContent: string;
}

export interface HostedPageJavascriptFile {
  /**
   * Whether the inline code should be treated as a JavaScript module. If this property is `true`, the `type` property will be set to `module` on the `script` tag.
   */
  isModule: boolean;
  /**
   * The content of the header `script` tag. If this property is defined, the `url` property should not be specified.
   */
  inlineContent?: string;
  /**
   * The URL of the JavaScript source file. If this property is defined, the `inlineContent` property should not be specified.
   */
  url?: string;
}

export function processHostedPage(
  element: HTMLElement,
  hostedPage: HostedPage
) {
  element.innerHTML = hostedPage.html;
  hostedPage.javascript?.forEach((file) => insertJS(file));
  hostedPage.css?.forEach((file) =>
    'url' in file ? insertCSSUrl(file) : insertCSSInline(file)
  );
}
function insertJS(file: HostedPageJavascriptFile) {
  const script = document.createElement('script');
  if (file.isModule) {
    script.type = 'module';
  }

  if (file.url) {
    script.src = file.url;
  }

  if (file.inlineContent) {
    script.innerHTML = file.inlineContent;
  }

  document.head.appendChild(script);
}

function insertCSSInline(file: HostedPageCssInlineFile) {
  const style = document.createElement('style');
  style.innerHTML = file.inlineContent!;

  document.head.appendChild(style);
}

function insertCSSUrl(file: HostedPageCssUrlFile) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = file.url;
  document.head.appendChild(link);
}
