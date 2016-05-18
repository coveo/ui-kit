# ![coveo.analytics](./assets/coveo.analytics.js.png)

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![dependency status](https://david-dm.org/coveo/coveo.analytics.js.svg)](https://david-dm.org/coveo/coveo.analytics.js)
[![dev dependency status](https://david-dm.org/coveo/coveo.analytics.js/dev-status.svg)](https://david-dm.org/coveo/coveo.analytics.js#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/coveo/coveo.analytics.js/badge.svg?branch=master)](https://coveralls.io/github/coveo/coveo.analytics.js?branch=master)

## Coveo usage analytic JavaScript client

This JavaScript client project provides a code snippet that a website administrator can easily add to website pages to push page view events to Coveo analytics whenever end-users access the pages. The Coveo code snippet is similar to the Google Analytics one, allowing you to track user sessions.

When your websites have many visitors, the `pageview` events volume can be very large.  Consequently, the pushed `pageview` events are stored in a Coveo usage analytics table which content currently cannot be viewed in usage analytics reports and the visit browser to prevent performance degradation.

Initially, the `pageview` events data will be used exclusively from Coveo Reveal, a machine learning service (see [Coveo Reveal](http://www.coveo.com/go?dest=cloudhelp&lcid=9&context=177)), by an upcoming feature that will recommend relevant items based on user behavior. It is recommended that you start pushing your events as soon as possible so that you will have data to use when the new feature becomes available.

### Pushing Coveo Analytics Pageview Events

1. Get your API key

  You need an Coveo Cloud organization API key that has the permission to write to the usage analytics sevice.
  * When using [Coveo Cloud V1](https://cloud.coveo.com/), contact [Coveo Support](https://coveocommunity.force.com/) and ask to create an API key with a **Write UA** scope.

  * When using [Coveo Cloud V2](https://platform.cloud.coveo.com/), create an API key from the [administration console] (https://platform.cloud.coveo.com/admin/#/organization/api-access/) selecting the **Edit** check box for the **Analytics data** privilege (see [API Access - Page](http://www.coveo.com/go?dest=ccv2ac&context=27)).

2. Add the code snippet to all your website pages.
  
  1. Copy the following code snippet in a text editor and replace `YOUR_API_KEY` by the API key you got in the previous step.

```html
<script>
(function(c,o,v,e,O,u,a){
a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
})(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/coveoua.js')

coveoua('init','YOUR_API_KEY'); // Replace YOUR_API_KEY with your real key
coveoua('send','pageview');
</script>
```

Note: Do not use a copy of the `coveoua.js` file as you would not get the automatic updates and could experience compatibility issues.

  2. Ask the administrator of the website to paste the modified code snippet in the appropriate location, such as a website page template, so that the code is added to all website pages.

3. Validate events are pushed.
  1. In a browser such as Chrome, navigate to a website page to which you added the code snippet.
  2. n the browser developer tool, go the the **Network** tab.
  3. Reload the page, in the **Name** panel, ensure that you see a **view** event sent to Coveo analytics.

#### Adding informations on items to be recommended

```js
// ...
coveoua('init','YOUR_API_KEY');
coveoua('send','pageview',{
  contentIDKey: options.contentIDKey,
  contentIDValue: options.contentIDValue,
  contentType: options.contentType
  // ... more information ...
});
```

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

### Contributing

```bash
git clone
npm install
./node_modules/.bin/typings install
npm run build:tsc
npm run build:webpack
# code code code
# open pull request
```

### License

MIT license (see [LICENSE](LICENSE)).

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
[![coveo](./assets/by-coveo.png)](http://www.coveo.com)
