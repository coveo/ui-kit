import {
  buildResultTemplatesManager,
  type Result,
  type Template,
} from '@coveo/headless';
import type {ItemTarget} from '@/src/components/common/layout/display-options';
import {
  TemplateProvider,
  type TemplateProviderProps,
} from '@/src/components/common/template-provider/template-provider';
import type {AnyBindings} from '../interface/bindings';

export class ItemTemplateProvider extends TemplateProvider<Result> {
  constructor(
    props: TemplateProviderProps<Result> & {bindings: AnyBindings},
    private gridCellLinkTarget?: ItemTarget
  ) {
    super(props, () => buildResultTemplatesManager(props.bindings.engine));
  }

  // TODO: Add JSX support for default template
  protected makeDefaultTemplate(): Template<
    Result,
    DocumentFragment,
    DocumentFragment
  > {
    const content = document.createDocumentFragment();
    const linkEl = document.createElement('atomic-result-link');
    content.appendChild(linkEl);

    const linkContent = document.createDocumentFragment();
    const linkMarkup = `
      <atomic-result-link>
      ${this.gridCellLinkTarget ? `<a slot="attributes" target="${this.gridCellLinkTarget}"></a>` : ''}
      </atomic-result-link>
    `;
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = linkMarkup.trim();
    linkContent.appendChild(linkTemplate.content);
    return {
      content,
      linkContent,
      conditions: [],
    };
  }
}
