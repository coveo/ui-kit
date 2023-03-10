# ![coveo.analytics](./assets/coveo.analytics.js.png)

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![Coverage Status](https://coveralls.io/repos/github/coveo/coveo.analytics.js/badge.svg?branch=master)](https://coveralls.io/github/coveo/coveo.analytics.js?branch=master)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.png?v=100)](https://github.com/ellerbrock/typescript-badges/)

# Coveo Analytics JavaScript client

The Coveo analytics javascript client, also called coveo.analytics.js or coveoua for short, is responsible for logging analytics events to the Coveo platform. Analytics events may include basic Coveo web events such as pageviews, clicks or searches. For specific usecases, such as commerce and service, dedicated events may be defined and logged.

The analytics library is bundled with all Coveo provided UI components. Integrations which exclusively rely on these components, generally don't have to interact with coveoua directly. For Coveo integrations which integrate with an already existing UI and do not use headless, coveoua will be required to ensure events are logged correctly.

## Loading and initializing the library in the browser

In order to ensure the tracking code is available on your webpage, the following code snippet needs to be added to the top of each page on which analytics are required. This will load the latest major version of coveo.analytics.js from a Coveo CDN. As of writing, the current major version is 2.

```html
<script>
    (function (c, o, v, e, O, u, a) {
        a = 'coveoua';
        c[a] =
            c[a] ||
            function () {
                (c[a].q = c[a].q || []).push(arguments);
            };
        c[a].t = Date.now();
        u = o.createElement(v);
        u.async = 1;
        u.src = e;
        O = o.getElementsByTagName(v)[0];
        O.parentNode.insertBefore(u, O);
    })(window, document, 'script', 'https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js');
</script>

coveoua('init', #COVEO_API_KEY); // Replace #COVEO_API_KEY with your api key
```

Since calls to the coveo analytics service need to be authenticated, the library needs to be initialized with a Coveo api key which has push access to the [Analytics Data Domain](https://docs.coveo.com/en/1707/cloud-v2-administrators/privilege-reference#analytics-data-domain). You can create an API key from the [administration console](https://platform.cloud.coveo.com/admin/#/organization/api-access/) selecting the **Push** option box for the **Analytics Data** domain (see [Adding and Managing API Keys](https://docs.coveo.com/en/1718/cloud-v2-administrators/adding-and-managing-api-keys)).

## Available actions

After the library has loaded sucessfully, you can interact with coveoua through the global `coveoua` function. Any interaction with the library happens through this function by supplying both a action name, followed by an optional series of action arguments. The following actions are available:

### Initialization

-   `coveoua('version')`: Returns the current version of the tracking library.
-   `coveoua('init', <COVEO_API_KEY>, <ENDPOINT>)`: Initializes the library with the given api key and endpoint. The following parameters are accepted
    -   COVEO_API_KEY (mandatory): A valid api key.
    -   ENDPOINT (optional): A string specifying the desired analytics endpoint. The default value is https://analytics.cloud.coveo.com/rest/ua. In case your organization is HIPAA enabled, you should override with https://analyticshipaa.cloud.coveo.com/rest/ua.
-   `coveoua('init', <COVEO_API_KEY>, {endpoint: <ENDPOINT>, plugins: <PLUGINS>})`: Initializes the library with the given api key, endpoint and plugins. The following parameters are accepted
    -   COVEO_API_KEY (mandatory): A valid api key.
    -   ENDPOINT (optional): An object string specifying the desired analytics endpoint. The default value is https://analytics.cloud.coveo.com/rest/ua. In case your organization is HIPAA enabled, you should override with https://analyticshipaa.cloud.coveo.com/rest/ua.
    -   PLUGINS (optional): An array of known plugin names. See [plugins](#plugins) for more information.
-   `coveoua('set', <NAME>, <VALUE>)`: Attempts to inject an attribute with given name and value on every logged event, overriding any existing value. Some payloads may reject attributes they do not support.
-   `coveoua('set', <OBJECT>)`: Attempts to inject all attributes and values of the given object on every logged event, overriding any existing value. Some payloads may reject attributes they do not support.
-   `coveoua('set', 'custom', <OBJECT>)`: Attempts to inject all attributes and values of the given object in the custom section of an object, overriding any existing value. Use this call to pass customer specific parameters on the payload.
-   `coveoua('onLoad', <CALLBACK>)`: Calls the specified function immediately, library initialization is not required.
-   `coveoua('reset')`: Resets the state of the logger to the state before initialization.

### Sending events

-   `coveoua('send', <EVENT_NAME>, <EVENT_PAYLOAD>)`: Sends an event with a given name and payload to the analytics endpoint.

### Plugin control

-   `coveoua('provide', <PLUGIN_NAME>, <PLUGINCLASS>)`: Registers a given pluginClass with the analytics library under the provided name.
-   `coveoua('require', <PLUGIN_NAME>)`: Explicitly loads the plugin with the given name.
-   `coveoua('callPlugin', <PLUGIN_NAME>, <FUNCTION>, <PARAMS>)`: Executes the specified function with given arguments on the given plugin name. Can be shorthanded using a plugin action prefix `coveoua(<PLUGINNAME>:<FUNCTION>, <PARAMS>)`.

## Plugins

Coveoua is set up in a modular way with different plugins providing functionality that may be specific to a given usecase. This allows you to customize some of its behavior dynamically. By default, the following plugins are loaded at library initialization:

-   `ec`: eCommerce plugin which takes care of sending eCommerce specific events.
-   `svc`: Service plugin which takes care of sending customer service specific events.

Plugin actions extend the set of available actions. They can be executed either via the `callPlugin` action above, or via the shorthand. For example, to call the function `addImpression` on the `ec` plugin, you'd specify `coveoua('ec:addImpression', ...)`.

It is possible to disable loading of any plugins by explicitly initializing the library with an empty list of plugins using `coveoua('init', <API_KEY>, {plugins:[]})`.

## Sending basic usage analytics events

In most common integration usecases, you will be using Coveo pre-wired components (e.g. jsui, headless or atomic) to handle communication with the Coveo backend. These components have their own specific apis to handle event logging.

When you are not using any specific Coveo web component, you need to send these events payloads explicitly, use the `send` action to transmit an assembled payload to the usage analytics backend. See the [Usage Analytics Events](https://docs.coveo.com/en/2949/analyze-usage-data/usage-analytics-events) documentation for description of the payload contents. The following event types are supported in coveoua:

-   `search`: sends a [client side search](https://docs.coveo.com/en/1502/build-a-search-ui/log-search-events) event.
-   `click`: sends a [click event](https://docs.coveo.com/en/2064/build-a-search-ui/log-click-events).
-   `view`: sends a [view event](https://docs.coveo.com/en/2651/build-a-search-ui/log-view-events).
-   `custom`: sends a [custom event](https://docs.coveo.com/en/2650/build-a-search-ui/log-custom-events).
-   `collect`: sends a [collect event](https://docs.coveo.com/en/l41i0031/build-a-search-ui/log-collect-events) payload. We strongly recommend you use the simplified api in the ecommerce plugin [to send these events instead](#sending-commerce-specific-events).

For example, in order to send a click event after a user has interacted with a Coveo provided result, first initialize the library with an api key and then send a click event with the appropriate payload. Refer to the [click event documentation](https://docs.coveo.com/en/2064/build-a-search-ui/log-click-events) for up to date information on event payloads.

```js
coveoua('send', 'click', {...});
```

You should be able to observe the click event being transmitted to the Coveo backend at `https://analytics.cloud.coveo.com/rest/ua/click` in the Developer tool's **Network** tab of your browser of choice.

## Sending commerce specific events

Commerce specific events such as product selections, shopping cart modifications and transactions are sent to Coveo in the compact [collect protocol](https://docs.coveo.com/en/l41i0031/build-a-search-ui/log-collect-events). Rather than explicitly assembling these payloads by hand, the eCommerce plugin provides apis to assemble and transmit the payloads. There are two event names that are specific to the eCommerce plugin:

-   `event`: A generic event, which has been assembled through different plugin actions.
-   `pageview`: An ecommerce specific pageview event which is automatically populated with the current page context.

See the [Send an Event](https://docs.coveo.com/en/l3am0254/coveo-for-commerce/send-an-event) page for more information on the expected payloads for both of these.

The eCommerce plugin supports adding product data (`ec:addProduct`), product impression data (`ec:addImpression`) as well as setting the [appropriate event action](https://docs.coveo.com/en/l29e0540/coveo-for-commerce/commerce-events-reference#product-action-type-reference) through `ec:setAction`. These calls can be used in series to assemble different types of payloads:

-   A [product detail view](https://docs.coveo.com/en/3188/coveo-for-commerce/commerce-data-health-implementation-guide#measuring-a-product-details-view)
-   An [addition to the cart](https://docs.coveo.com/en/l3jg0266/coveo-for-commerce/measure-cart-page-events#measure-an-increase-in-item-quantity-in-cart)
-   A [removal from the cart](https://docs.coveo.com/en/l3jg0266/coveo-for-commerce/measure-cart-page-events#measure-a-decrease-in-item-quantity-in-cart)
-   A [cart purchase](https://docs.coveo.com/en/l39m0327/coveo-for-commerce/measure-a-purchase)
-   An [event on a search-driven listing-page](https://docs.coveo.com/en/l41a1037/coveo-for-commerce/measure-events-on-a-listing-or-search-page)

As a sample, here is how an [addition to the cart interaction](https://docs.coveo.com/en/l3jg0266/coveo-for-commerce/measure-cart-page-events#measure-an-increase-in-item-quantity-in-cart) is measured:

1. First use the `ec:addProduct` action to include the [relevant product data](https://docs.coveo.com/en/l29e0540/coveo-for-commerce/commerce-events-reference#product-data-fields-reference) in the event you’re about to send
    ```js
    coveoua('ec:addProduct', <PRODUCT_DATA>);
    ```
2. Then use the `ec:setAction` action to specify that the [action done on this data](https://docs.coveo.com/en/l29e0540/coveo-for-commerce/commerce-events-reference#product-action-type-reference) is an addition to the cart.
    ```js
    coveoua('ec:setAction', 'add');
    ```
3. Finally, use the `send` action to send the generic event to Coveo Usage Analytics. The payload is implicit in this case, and has been generated by the plugin.
    ```js
    coveoua('send', 'event');
    ```

## Linking clientIds across different domains using a URL parameter

To help track a visitor across different domains, the library offers functionality to initialize a clientId from a URL query parameter. The query parameter is named `cvo_cid` with value `<clientid>.<timestamp>`. The clientId is encoded without dashes and the timestamp is encoded in seconds since epoch, both to save space in the url. Both are separated by a period. A sample parameter could be `cvo_cid=c0b48880743e484f8044d7c37910c55b.1676298678`. This query parameter will be picked up by the target page if the following conditions hold:

-   The target page has a equal or greater version of coveo.analytics.js loaded.
-   The current URL contains a `cvo_cid` query parameter
-   The parameter contains a valid uuid.
-   The parameter contains a valid timestamp, and that timestamp is no more than 120 seconds in the past.
-   The receiving page has specified a list of valid referrers and the current referrer host matches that list, using wildcards, including ports, specified using `coveoua('link:acceptFrom', [<referrers>])`.

Given that you want to ensure the clientId remains consistent when you navigate from a source page on http://foo.com/index.html to a target page http://bar.com/index.html, the following steps are needed.

1. Ensure coveo.analytics.js is loaded on the source page.
2. Modify the source page such that whenever a link to the target page is clicked, its `href` is replaced by `coveoua('link:decorate', 'http://bar.com/index.html')`. For example, by creating an onClick event listener on the element or on the page. It's important that the decorated link is generated at the moment the link is clicked, as it will be valid only for a short time after generation.

```html
<script>
    async function decorate(element) {
        element.href = await coveoua('link:decorate', element.href);
    }
</script>
<a onclick="decorate(this)" href="http://bar.com/index.html">Navigate</a>>
```

3. Ensure coveo.analytics.js is loaded on the target page.
4. Ensure that the target page allows reception of links from the source page by adding `coveoua('link:acceptFrom', ['foo.com']);` immediately after script load.

# Developer information

Information for contributors or Coveo developers developing or integrating coveoua.

## Setup

```bash
git clone
npm install
npm run build
```

## Running and observing the code

There are two ways to run your code locally:

1. Run `npm run start` and open your browser on http://localhost:9001

2. Debugging through VSCode debugger with the `Debug: Start Debugging` command, using the `Launch Chrome` configuration.

To test out your changes, add `coveoua` function calls in the `public/index.html` file and check the payload in the `Developer Console` section of your browser.

## Running tests

1. From the command line through `npm run test`.
2. Debugging through VSCode debugger with the `Debug: Start Debugging` command, using the `Jest All` configuration.

## Storage and persistence

Coveo.analytics.js tracks interactions from the same browser client, through a client side provided uuid called a `clientId`. This clientId is initialized on first use and there are multiple options for persisting it's value:

-   Cookie storage, which supports top level domain storage. This means that the clientId for a.foo.com will be identical to the one on b.foo.com.
-   Local storage, which allows to store much more information client side, but has the drawback of not being able to access data across multiple top level domains.
-   Session storage, which has roughly the same limitation and capability as Local storage, except that it is cleared when the web browser tab is closed.

By default, coveoua will use both local storage and cookie storage to persist its clientId. If your environment does not support local persistence, it's possible to write your own storage abstraction.

## Using coveo.analytics.js with React Native

Since React Native does not run inside a browser, it cannot use cookies or the local/session storage that modern browsers provide. You must provide your own Storage implementation. Thankfully, there exist multiple packages to store data:

-   [React native community AsyncStorage](https://github.com/react-native-async-storage/async-storage) (recommended)
-   [React native AsyncStorage](https://reactnative.dev/docs/asyncstorage) (deprecated)
-   [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)

A sample React native storage class implementation could look as follows

```js
import {CoveoAnalyticsClient, ReactNativeRuntime} from 'coveo.analytics/react-native';
// Use any React native storage library or implement your own.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample storage class
class ReactNativeStorage implements WebStorage {
    async getItem(key: string) {
        return AsyncStorage.getItem(key);
    }
    async setItem(key: string, data: string) {
        return AsyncStorage.setItem(key, data);
    }
    async removeItem(key: string) {
        AsyncStorage.removeItem(key);
    }
}

// Create an API client with a specific runtime
const client = new CoveoAnalyticsClient({
    token: 'YOUR_API_KEY',
    runtimeEnvironment: new ReactNativeRuntime({
        token: 'YOUR_API_KEY',
        storage: new ReactNativeStorage(),
    }),
});

// Send your event
client.sendCustomEvent({
    eventType: 'dog',
    eventValue: 'Hello! Yes! This is Dog!',
    language: 'en',
});
```

## Conformance

Chrome, Firefox, Safari, Edge. IE11 support on a reasonable-effort basis.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT license (see [LICENSE](LICENSE)).

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![coveo](./assets/by-coveo.png)](https://www.coveo.com)
