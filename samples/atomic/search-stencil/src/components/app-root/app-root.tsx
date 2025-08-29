import type {AtomicSearchInterface} from '@coveo/atomic/components';
import {
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '@coveo/headless';
// biome-ignore lint/correctness/noUnusedImports: <>
import {Component, h} from '@stencil/core';
import {createRouter, Route} from 'stencil-router-v2';
import {Header, homePath, searchPath} from '../header/header.js';

const Router = createRouter();

@Component({
  tag: 'app-root',
  shadow: false,
})
export class AppRoot {
  private engine?: SearchEngine;
  public async componentDidLoad() {
    const searchInterface: AtomicSearchInterface = document.querySelector(
      'atomic-search-interface'
    )!;

    await customElements.whenDefined('atomic-search-interface');
    await searchInterface.initialize({
      ...getSampleSearchEngineConfiguration(),
      analytics: {analyticsMode: 'legacy'},
    });
    this.engine = searchInterface.engine!;

    if (Router.activePath === searchPath) {
      searchInterface.executeFirstSearch();
    }
  }

  public render() {
    return (
      <atomic-search-interface>
        <Header>
          <atomic-search-box
            redirection-url={
              Router.activePath === homePath ? searchPath : undefined
            }
            onRedirect={(e) => {
              e.preventDefault();
              const {redirectTo, value} = e.detail;
              const path = `${redirectTo}#q=${value}`;
              Router.push(path);
            }}
          ></atomic-search-box>
        </Header>
        <Router.Switch>
          <Route path="/" render={() => <h1>Home</h1>} />
          <Route
            path="/search"
            render={() => <search-page engine={this.engine}></search-page>}
          />
        </Router.Switch>
      </atomic-search-interface>
    );
  }
}
