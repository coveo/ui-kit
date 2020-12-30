import {Engine, HeadlessEngine, searchAppReducers} from '@coveo/headless';
import React from 'react';
import './App.css';

class App extends React.Component {
  private engine: Engine;

  constructor(props: any) {
    super(props);
    this.engine = new HeadlessEngine({
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: searchAppReducers,
    });
  }

  private setEngine(componentRef: any) {
    if (componentRef) {
      componentRef.engine = this.engine;
    }
  }

  render() {
    return (
      <div className="container-xl">
        {/* Using the engine directly */}
        <atomic-search-box
          ref={(ref) => this.setEngine(ref)}
        ></atomic-search-box>
        <atomic-result-list
          ref={(ref) => this.setEngine(ref)}
        ></atomic-result-list>

        {/* External component using search-interface reference */}
        <atomic-search-box search-interface-id="search">
          <span slot="submit-button">Go!</span>
        </atomic-search-box>

        {/* Sample Search interface */}
        <atomic-search-interface id="search" sample>
          <atomic-result-list>
            <atomic-result-template>
              <hr />
              <h5>
                {`{{title}}`}
              </h5>
              <p>
                <atomic-result-value value="excerpt"> </atomic-result-value>
              </p>
              <a href="{{clickUri}}">
                More info
              </a>
            </atomic-result-template>
          </atomic-result-list>
        </atomic-search-interface>
      </div>
    );
  }
}

export default App;
