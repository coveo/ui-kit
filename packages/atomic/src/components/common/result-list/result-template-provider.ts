import {Result, buildResultTemplatesManager} from '@coveo/headless';
import {AnyBindings} from '../interface/bindings';
import {AnyResult, extractUnfoldedResult} from '../interface/result';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../template-provider/template-provider';

export class ResultTemplateProvider extends TemplateProvider<Result> {
  constructor(props: TemplateProviderProps<Result> & {bindings: AnyBindings}) {
    super(props, () => buildResultTemplatesManager(props.bindings.engine));
  }

  public getTemplateContent(result: AnyResult) {
    return super.getTemplateContent(extractUnfoldedResult(result));
  }
}
