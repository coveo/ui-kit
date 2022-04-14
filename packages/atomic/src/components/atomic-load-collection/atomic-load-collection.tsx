import {
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
  ResultList,
  ResultListState,
  buildResultList,
  Result,
  FoldedResultList,
  buildFoldedResultList,
} from '@coveo/headless';
import {Component, Element, h, Prop, State} from '@stencil/core';
import {Bindings, InitializeBindings} from '../../utils/initialization-utils';
import {Button} from '../common/button';
import {ResultContext} from '../result-template-components/result-template-decorators';

/**
 */
@Component({
  tag: 'atomic-load-collection',
})
export class AtomicLoadMoreResults {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() public result!: Result;
  @State() public error!: Error;
  @Element() host!: HTMLElement;
  public foldedResultList!: FoldedResultList;

  public initialize() {
    console.log('this.bindings.engine:', this.bindings.engine);
    this.foldedResultList = buildFoldedResultList(this.bindings.engine, {
      options: {},
    });
  }

  public render() {
    // console.log('this', this.result);
    return <Button style="primary">Load more</Button>;
  }
}
