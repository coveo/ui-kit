## coveo.analytics

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![dependency status](https://david-dm.org/coveo/coveo.analytics.js.svg)](https://david-dm.org/coveo/coveo.analytics.js)
[![dev dependency status](https://david-dm.org/coveo/coveo.analytics.js/dev-status.svg)](https://david-dm.org/coveo/coveo.analytics.js#info=devDependencies)

> Coveo's usage analytics javascript client

## Usage

You have to provide your own `promise` and `fetch` api compatible libraries.

```bash
npm install coveo.analytics
```

Then use in typescript or javascript

```js
var coveoanalytics = require('coveo.analytics')
var analytics = coveoanalytics.analytics;

// Create an api client
var client = new analytics.Client({ token : 'PLACE THE TOKEN HERE'})
// Send your event
client.SendCustomEvent({
  eventType: "testEvent";
  eventValue: "Hello! Yes! This is Dog!";
});
```

## Web Analytics Usage

```html
<script>
(function(k,r,y,p,t,o,n){
n='coveoua';k[n]=k[n]||function(){(k[n].q=k[n].q|| []).push(arguments)};
k[n].t=Date.now();o=r.createElement(y);o.async=1;o.src=p;
t=r.getElementsByTagName(y)[0];t.parentNode.insertBefore(o,t)
})(window,document,'script','https://static.cloud.coveo.com/coveo.analytics.js/coveo.analytics.js')

// Replace YOUR-TOKEN with your real token
// (eg: an API key which has the rights to write into Coveo UsageAnalytics)
coveoua('init','YOUR-TOKEN');
coveoua('send','pageView');
</script>
```

To Add additional informations and/or give hints to Coveo's Reveal engine.

```js
// ...
coveoua('init','YOUR-TOKEN');
coveoua('send','pageView',{
  contentIDKey: options.contentIDKey,
  contentIDValue: options.contentIDValue,
  contentType: options.contentType
  // ... more information ...
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

MIT license; see [LICENSE](./LICENSE).

[![forthebadge](http://forthebadge.com/images/badges/gluten-free.svg)](http://forthebadge.com)
