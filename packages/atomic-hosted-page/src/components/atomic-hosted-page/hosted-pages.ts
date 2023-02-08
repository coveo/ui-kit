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
  css?: HostedPageCssFile[];
  /**
   * The creation timestamp. (ISO 8601)
   */
  created: string;

  /**
   * The [principal](https://en.wikipedia.org/wiki/Principal_(computer_security)) that created the hosted search page.
   */
  createdBy: string;

  /**
   * The last update timestamp. (ISO 8601)
   */
  updated: string;

  /**
   * The principal that last updated the hosted search page.
   */
  updatedBy: string;
}

export interface HostedPageCssFile {
  /**
   * The content of the header `style` tag. If this property is defined, the `url` property should not be specified.
   */
  inlineContent?: string;
  /**
   * The URL of CSS stylesheet. If this property is defined, the `inlineContent` property should not be specified.
   */
  url?: string;
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
