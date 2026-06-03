import {
  buildSearchBox,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type SearchBox as HeadlessSearchBox,
  type SearchEngine,
} from '@coveo/headless';
import {Component} from 'react';
import {SearchBox} from '../components/search-box/search-box.fn';

declare global {
  interface Window {
    dataLayer: {push: (payload: Record<string, unknown>) => void};
  }
}

/**
 * This no op is meant to simulate the standard Google Tag Manager data layer.
 *
 * In a real life scenario, you would arrange for Google Tag Manager to be globally available, following [Google documentation](https://developers.google.com/tag-platform/tag-manager/web/datalayer#datalayer).
 */
const fakeDataLayer = {
  push: () => {},
};
window.dataLayer = fakeDataLayer;

const pushToGoogleDataLayer = (payload: Record<string, unknown>) => {
  window.dataLayer.push(payload);
};

type AnalyticsHooksProps = {};

export class AnalyticsHook extends Component<
  AnalyticsHooksProps,
  {analyticsPayload: Record<string, unknown>}
> {
  private engine: SearchEngine;
  private searchBox: HeadlessSearchBox;
  constructor(props: AnalyticsHooksProps) {
    super(props);
    this.state = {analyticsPayload: {}};
    const sampleConfig = getSampleSearchEngineConfiguration();
    this.engine = buildSearchEngine({
      configuration: {
        ...sampleConfig,
        analytics: {
          /**
           * The analytics client middleware lets you access all the standard search page analytics events data.
           *
           * This allows you to modify or augment the standard payload and return the modified object.
           *
           * You can also use this hook to simply push data to an external system, such as Google Tag Manager.
           *
           */
          analyticsClientMiddleware: (_eventType, payload) => {
            this.setState({analyticsPayload: payload});
            pushToGoogleDataLayer(payload);
            return payload;
          },
        },
      },
    });
    this.searchBox = buildSearchBox(this.engine);
  }

  render() {
    return (
      <>
        <SearchBox controller={this.searchBox} />
        <p>
          Use the searchbox to input queries and print to the analytics payload
          below
        </p>

        <code>{JSON.stringify(this.state.analyticsPayload, null, 4)}</code>
      </>
    );
  }
}
