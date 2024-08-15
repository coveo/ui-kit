import {Result, buildResultTemplatesManager} from '@coveo/headless';
import {AnyBindings} from '../interface/bindings';
import {AnyItem, extractUnfoldedItem} from '../interface/item';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../template-provider/template-provider';

export class ItemTemplateProvider extends TemplateProvider<Result> {
  constructor(props: TemplateProviderProps<Result> & {bindings: AnyBindings}) {
    super(props, () => buildResultTemplatesManager(props.bindings.engine));
  }

  public getTemplateContent(result: AnyItem) {
    return super.getTemplateContent(extractUnfoldedItem(result));
  }

  public getLinkTemplateContent(result: AnyItem) {
    return super.getLinkTemplateContent(extractUnfoldedItem(result));
  }
}
