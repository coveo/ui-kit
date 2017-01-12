# ![coveo.analytics](./assets/coveo.analytics.js.png)

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![dependency status](https://david-dm.org/coveo/coveo.analytics.js.svg)](https://david-dm.org/coveo/coveo.analytics.js)
[![dev dependency status](https://david-dm.org/coveo/coveo.analytics.js/dev-status.svg)](https://david-dm.org/coveo/coveo.analytics.js#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/coveo/coveo.analytics.js/badge.svg?branch=master)](https://coveralls.io/github/coveo/coveo.analytics.js?branch=master)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.png?v=100)](https://github.com/ellerbrock/typescript-badges/)

## Coveo Usage Analytic JavaScript client

This project provides 3 ways to interact with the the Coveo Usage Analytics service.

- A JavaScript Node.js client
- A JavaScript browser client
- A code snippet to add in websites pages

## Usage (Web analytics)

This JavaScript client project provides a code snippet that website administrators can easily add to website pages to track `pageview` events. The `pageview` events are stored in a Coveo Usage Analytics table which content currently cannot be viewed in Usage Analytics reports and the visit browser to prevent performance degradation.

Initially, the `pageview` events data will be used exclusively by the Coveo Reveal Recommendations feature (see [Recommendations Feature](https://onlinehelp.coveo.com/en/cloud/coveo_reveal_features.htm#Recommendations)). It is recommended that you start pushing `pageview` events to the Coveo Usage Analytics service as soon as possible so that you get relevant items recommended.

**Note: This Coveo code snippet is similar to the Google analytics one (analytics.js).**

### Pushing Coveo Analytics Pageview Events for Recommendations

1. Get an API key.

  You need a Coveo Cloud API key that has the permission to write to the Usage Analytics service.

  - For [Coveo Cloud V1](https://cloud.coveo.com/), contact [Coveo Support](https://coveocommunity.force.com/) and ask to create an API key with the **Write UA** scope.

  - For [Coveo Cloud V2](https://platform.cloud.coveo.com/), create an API key from the [administration console] (https://platform.cloud.coveo.com/admin/#/organization/api-access/) selecting the **Edit** check box for the **Analytics data** privilege (see [API Access - Page](http://www.coveo.com/go?dest=ccv2ac&context=27)).

2. Add the code snippet to all your website pages.
  
  Ask an administrator to add a code snippet like the following to all pages of your websites:

  ```html
  <script>
  (function(c,o,v,e,O,u,a){
  a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
  c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
  O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
  })(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/coveoua.js')
  
  coveoua('init','YOUR_API_KEY'); // Replace YOUR_API_KEY with your real key
  coveoua('send','pageview',{
    contentIdKey: '@sysurihash',
    contentIdValue: 'somehash3125091',
    contentType: 'value for contentType' // Optional
    // ... more information ...
  });
  </script>
  ```
  Make sure you replace `YOUR_API_KEY` by the API key you got in the previous step.
  
  The code snippet must contain `contentIdKey` and `contentIdValue` in order to identify items in the Coveo index. When you want to recommend specific types of content, you also need to add a `contentType` parameter value.
  
  | Key            | Value                                                               |
  | ---------------|---------------------------------------------------------------------|
  | contentIdKey   | The Coveo index field name that will be used to identify the item.  |
  | contentIdValue | The Coveo index field value that will be used to identify the item. |
  | contentType    | [Optional] The type of the item to be tracked (e.g., 'Article').    |
  
  **Note: Do not copy the_ `coveoua.js` _file as it can be updated anytime and you could experience compatibility issues.**
  
3. Validate pageview events are pushed to the Coveo Usage Analytics service

  a. In a web browser such as Chrome, navigate to a website page to which you added the code snippet.

  b. In the browser developer tool, go the the **Network** tab.

  c. Reload the page, in the **Name** panel, ensure that you see a **view** event sent to Coveo analytics.

### Usage (for developers)

You have to provide your own `fetch` API compatible libraries in the global environment (see [Isomorphic TypeScript, fetch, promises, ava and coverage](http://source.coveo.com/2016/05/11/isomorphic-typescript-ava-w-coverage/)).

```bash
npm install coveo.analytics isomorphic-fetch
```

```js
import fetch from 'isomorphic-fetch'; // isomorphic-fetch modifies the global environment
import coveoanalytics from 'coveo.analytics';

// Create an API client
const client = new coveoanalytics.analytics.Client({ token : 'YOUR_API_KEY'})
// Send your event
client.sendCustomEvent({
  eventType: "dog";
  eventValue: "Hello! Yes! This is Dog!";
});
```

### Choosing the type of storage for page view events
There are 3 available storage you can use to store view events client side.

- Cookie storage, which supports top level domain storage. This means that events from a.foo.com will be available from b.foo.com.
Cookies have the limitation of not being able to store a lot of data, especially if your page view that are stored are long.

- Local storage, which allows to store much more information client side, but has the drawback of not being able to acess data
across multiple top level domain.

- Session storage, which has roughly the same limitation and capability as Local storage, except that it is cleared when the web browser tab is closed.

By default, the local storage option will automatically be chosen as the default storage, unless specified manually.

### Contributing

```bash
git clone
npm install
./node_modules/.bin/typings install
npm run build
# code code code
npm run test
# open pull request
```

### License

MIT license (see [LICENSE](LICENSE)).

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
[![coveo](./assets/by-coveo.png)](http://www.coveo.com)
