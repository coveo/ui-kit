import { Component, h, State } from '@stencil/core';
import { ResultList, ResultListState, Unsubscribe } from '@coveo/headless';
import { headlessEngine } from '../../engine';

@Component({
  tag: 'atomic-result-list',
  styleUrl: 'atomic-result-list.css',
  shadow: true,
})
export class AtomicResultList {
  private resultList: ResultList;
  private unsubscribe: Unsubscribe;
  @State() state!: ResultListState;
  
  constructor() {
    this.resultList = new ResultList(headlessEngine);
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.resultList.state
  }

  private get results() {
    return this.state.results.map(result => <p>{result.title}</p>)
  }

  public render() {
    return this.results;
  }
}
