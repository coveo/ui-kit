# ![coveo.analytics](./assets/coveo.analytics.js.png)

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![dependency status](https://david-dm.org/coveo/coveo.analytics.js.svg)](https://david-dm.org/coveo/coveo.analytics.js)
[![dev dependency status](https://david-dm.org/coveo/coveo.analytics.js/dev-status.svg)](https://david-dm.org/coveo/coveo.analytics.js#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/coveo/coveo.analytics.js/badge.svg?branch=master)](https://coveralls.io/github/coveo/coveo.analytics.js?branch=master)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.png?v=100)](https://github.com/ellerbrock/typescript-badges/)

## Coveo Usage Analytic JavaScript client

This project provides 2 ways to interact with the Coveo Usage Analytics service.

-   A JavaScript browser client
-   A code snippet to add in website pages

## Usage (Web analytics)

This JavaScript client provides a code snippet that can easily be added to website pages to track events. The `pageview` events are stored in a Coveo Usage Analytics table which content currently cannot be viewed in Usage Analytics reports and the visit browser to prevent performance degradation.

Initially, the `pageview` events data will be used exclusively by the Coveo ML Event Recommendations (ER) Feature (see [Event Recommendations (ER) Feature](https://docs.coveo.com/en/1671/coveo-machine-learning/coveo-machine-learning-features#ER)). It is recommended that you start sending `pageview` events to the Coveo Usage Analytics service as soon as possible so that you get relevant items recommended.

On top of `pageview` events, generic and commerce events can also be tracked. See [Tracking Commerce Events](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events).

**Note: This Coveo code snippet is similar to the Google analytics one (analytics.js).**

### Sending Coveo Analytics Page View Events for Recommendations

1. Get an API key.

    You need a Coveo Cloud API key which has the [**Push** access level on the **Analytics Data** domain](https://docs.coveo.com/en/1707/cloud-v2-administrators/privilege-reference#analytics-data-domain) to send events (see [User Authentication](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#user-authentication)).

    Create an API key from the [administration console](https://platform.cloud.coveo.com/admin/#/organization/api-access/) selecting the **Push** option box for the **Analytics Data** domain (see [Adding and Managing API Keys](https://docs.coveo.com/en/1718/cloud-v2-administrators/adding-and-managing-api-keys)).

2. Add the code snippet to all your website pages.

    Add a code snippet like the following to all pages of your websites:

    ```html
    <script>
        (function(c,o,v,e,O,u,a){
        a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
        c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
        O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
        })(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js')
        // Replace "2" in the script url with the latest release

        coveoua('init', <COVEO_API_KEY>); // Replace <COVEO_API_KEY> with your real key
        coveoua('send', 'view', {
            contentIdKey: '@permanentid',
            contentIdValue: <PERMANENT_ID_VALUE>, // Replace <PERMANENT_ID_VALUE> with a unique value from your page.
            contentType: 'product', // Optional
            // ... more information ...
        });
    </script>
    ```

    The code snippet must contain `contentIdKey` and `contentIdValue` in order to identify items in the Coveo index. When you want to recommend specific types of content, you also need to add a `contentType` parameter value.

    | Key            | Value                                                               |
    | -------------- | ------------------------------------------------------------------- |
    | contentIdKey   | The Coveo index field name that will be used to identify the item.  |
    | contentIdValue | The Coveo index field value that will be used to identify the item. |
    | contentType    | [Optional] The type of the item to be tracked (e.g., 'Article').    |

    **Note: Do not copy the `coveoua.js` file as it can be updated anytime and you could experience compatibility issues.**

3. Validate `pageview` events are sent to the Coveo Usage Analytics service

    a. In a web browser such as Chrome, navigate to a website page to which you added the code snippet.

    b. In the browser developer tool, go the the **Network** tab.

    c. Reload the page, in the **Name** panel, ensure that you see a **view** event sent to Coveo analytics.

### Sending Any Coveo Analytics Events

Add the code snippet to all your website pages.

```html
<script>
    (function(c,o,v,e,O,u,a){
    a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
    c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
    O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
    })(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js') // Replace "2" in the script url with the latest release
    coveoua('init', <COVEO_API_KEY>); // Replace <COVEO_API_KEY> with your real key
</script>
```

You can now call the script using the following line:

```js
coveoua('send', 'click', { ... });
```

Refer to the [Usage Analytics Write API](https://docs.coveo.com/en/1430/cloud-v2-developers/usage-analytics-write-api) section to see what types of events are supported and what payload you need to send.

### Sending Commerce Events

Add the code snippet to all your website pages.

```html
<script>
    (function(c,o,v,e,O,u,a){
    a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
    c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
    O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
    })(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js') // Replace "2" in the script url with the latest release
    coveoua('init', <COVEO_API_KEY>); // Replace <COVEO_API_KEY> with your real key
</script>
```

To send commerce events, call `coveoua` with the event name. Here is how an [addition to the cart interaction](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#measuring-an-addition-to-the-cart) is measured:

1. First use the `ec:addProduct` command to include the relevant product data in the event you’re about to send
    ```js
    coveoua('ec:addProduct', <PRODUCT_DATA>);
    ```
2. Then use the `ec:setAction` command to specify that the action done on this data is an addition to the cart:
    ```js
    coveoua('ec:setAction', 'add');
    ```
3. Finally, use the `send` command to send the event to Coveo Usage Analytics.
    ```js
    coveoua('send', 'event');
    ```

Refer to the [**Tracking Commerce Events** page](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events) to see how to measure [a product details view](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#measuring-a-product-details-view), [an addition to the cart](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#measuring-an-addition-to-the-cart), [a removal from the cart](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#measuring-a-removal-from-the-cart), [a purchase](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#measuring-purchases) or [an event on a search-driven listing-page](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#measuring-events-on-a-search-driven-listing-page) in more details.

All supported actions are also listed in the [**Possible Actions** section of the **Tracking Commerce Events** page](https://docs.coveo.com/en/3188/coveo-solutions/tracking-commerce-events#possible-actions).

### Usage (for developers)

You need to provide your own `fetch` API compatible libraries in the global environment (see [Isomorphic TypeScript, fetch, promises, ava and coverage](https://source.coveo.com/2016/05/11/isomorphic-typescript-ava-w-coverage/)).

```bash
npm install coveo.analytics isomorphic-fetch
```

```js
import {CoveoAnalyticsClient} from 'coveo.analytics';

// Create an API client
const client = new CoveoAnalyticsClient({token: 'YOUR_API_KEY'});
// Send your event
client.sendCustomEvent({
    eventType: 'dog',
    eventValue: 'Hello! Yes! This is Dog!',
});
```

## Using React Native

```js
import {CoveoAnalyticsClient, ReactNativeRuntime} from 'coveo.analytics/react-native';

// Create an API client
const client = new CoveoAnalyticsClient({runtimeEnvironment: ReactNativeRuntime({})});
// Send your event
client.sendCustomEvent({
    eventType: 'dog',
    eventValue: 'Hello! Yes! This is Dog!',
});
```

### Choosing the type of storage for page view events

There are 3 available storage types you can use to store view events client side.

-   Cookie storage, which supports top level domain storage. This means that events from a.foo.com will be available from b.foo.com. Cookies have the limitation of not being able to store a lot of data, especially if your stored page views are long.

-   Local storage, which allows to store much more information client side, but has the drawback of not being able to access data across multiple top level domains.

-   Session storage, which has roughly the same limitation and capability as Local storage, except that it is cleared when the web browser tab is closed.

By default, the local storage option will automatically be chosen as the default storage, unless manually specified.

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

#### Setup

```bash
git clone
npm install
npm run build
```

#### Running the project

There are two ways to run your code locally:

1. run `npm start` and open your browser on http://localhost:9001

2. run through VSCode debugger with the `Debug: Start Debugging` command, using the `Launch Chrome` configuration.

To test out your changes, add `coveoua` function calls in the `public/index.html` file and check the payload in the `Developer Console` section of your browser.

#### Running tests

```bash
npm run test
```

### License

MIT license (see [LICENSE](LICENSE)).

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![coveo](./assets/by-coveo.png)](https://www.coveo.com)
