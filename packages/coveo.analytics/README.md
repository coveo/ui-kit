# ![coveo.analytics](./assets/coveo.analytics.js.png)

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![dependency status](https://david-dm.org/coveo/coveo.analytics.js.svg)](https://david-dm.org/coveo/coveo.analytics.js)
[![dev dependency status](https://david-dm.org/coveo/coveo.analytics.js/dev-status.svg)](https://david-dm.org/coveo/coveo.analytics.js#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/coveo/coveo.analytics.js/badge.svg?branch=master)](https://coveralls.io/github/coveo/coveo.analytics.js?branch=master)

### Coveo usage analytic JavaScript client

This JavaScript client project provides a code snippet that a website administrator can easily add to website pages to push page view events to Coveo analytics whenever end-users access the pages. The Coveo code snippet is similar to the Google Analytics one, allowing you to track user sessions.

When your websites have many visitors, the pageview events volume can be very large.  Consequently, the pushed pageview events are stored in a Coveo usage analytics table which content currently cannot be viewed in usage analytics reports and the visit browser to prevent performance degradation.

Initially, the pageview events data will be used exclusively from Coveo Reveal, a machine learning service (see Coveo Reveal), by an upcoming feature that will recommend relevant items based on similar user behavior. It is recommended that you start pushing your events as soon as possible so that you will have data to use when the new feature becomes available.

```html
<script>
(function(c,o,v,e,O,u,a){
a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
})(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/coveoua.js')

// Replace YOUR_API_KEY with your real key
coveoua('init','YOUR_API_KEY');
coveoua('send','pageview');
</script>
```

To Add additional informations or give hints to Coveo's Reveal engine.

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

## Usage (for developers)

You have to provide your own `fetch` API compatible libraries in the global environment.

```bash
npm install coveo.analytics isomorphic-fetch
```

Then use in TypeScript or javascript

```js
import fetch from 'isomorphic-fetch'; // isomorphic-fetch modifies global environment
import coveoanalytics from 'coveo.analytics';

// Create an api client
const client = new coveoanalytics.analytics.Client({ token : 'YOUR-TOKEN'})
// Send your event
client.sendCustomEvent({
  eventType: "dog";
  eventValue: "Hello! Yes! This is Dog!";
});
```

## Contributing

```bash
git clone
npm install
./node_modules/.bin/typings install
npm run build:tsc
npm run build:webpack
# code code code
# open pull request
```

## License

MIT license. See [LICENSE](LICENSE).

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
[![coveo](./assets/by-coveo.png)](http://www.coveo.com)
