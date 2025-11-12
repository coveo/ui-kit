interface HostedPage {
  /**
   * The HTML of the hosted page.
   */
  html: string;
  /**
   * The JavaScript resources appended to the header of a specific hosted page in the target Coveo organization.
   */
  javascript?: HostedPageJavascriptFile[];
  /**
   * The CSS resources appended to the header, pertaining to a specific hosted page in the target Coveo organization.
   */
  css?: HostedPageCSS[];
}

type HostedPageCSS = HostedPageCssInlineFile | HostedPageCssUrlFile;

interface HostedPageCssUrlFile {
  /**
   * The URL of CSS stylesheet.
   */
  url: string;
}

interface HostedPageCssInlineFile {
  /**
   * The content of the header `style` tag.
   */
  inlineContent: string;
}

interface HostedPageJavascriptFile {
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

  if (file.url && file.inlineContent) {
    console.error('Both url and inlineContent are defined in the same file.');
    return;
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
