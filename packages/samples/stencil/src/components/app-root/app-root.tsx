import {Component, Host, h, Fragment} from '@stencil/core';
import {createRouter, Route} from 'stencil-router-v2';
import {Header} from '../header/header';

const Router = createRouter();

@Component({
  tag: 'app-root',
  shadow: false,
})
export class AppRoot {
  render() {
    return (
      <Host>
        <Router.Switch>
          <Route
            path="/"
            render={() => (
              <Fragment>
                <Header>
                  <standalone-search-box
                    router={Router}
                  ></standalone-search-box>
                </Header>
                <h1>Home</h1>
              </Fragment>
            )}
          />
          <Route path="/search" render={() => <search-page></search-page>} />
        </Router.Switch>
      </Host>
    );
  }
}
