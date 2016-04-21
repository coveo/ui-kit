# ![coveo.analytics](media/header.png)

[![Build Status](https://travis-ci.org/coveo/coveo.analytics.js.svg?branch=master)](https://travis-ci.org/coveo/coveo.analytics.js)
[![dependency status](https://david-dm.org/coveo/coveo.analytics.js.svg)](https://david-dm.org/coveo/coveo.analytics.js)
[![dev dependency status](https://david-dm.org/coveo/coveo.analytics.js/dev-status.svg)](https://david-dm.org/coveo/coveo.analytics.js#info=devDependencies)

> Coveo's usage analytics javascript client

## Usage

You have to provide your own `promise` and `fetch` API compatible libraries.

```bash
npm install coveo.analytics
```

Then use in typescript or javascript

```js
import coveoanalytics from 'coveo.analytics';

// Create an api client
const client = new coveoanalytics.analytics.Client({ token : 'YOUR-TOKEN'})
// Send your event
client.sendCustomEvent({
  eventType: "dog";
  eventValue: "Hello! Yes! This is Dog!";
});
```

### Web Analytics Usage

```html
CoVeo
<script>
(function(c,o,v,e,O,u,a){
a='coveoua';c[a]=c[a]||function(){(c[a].q=c[a].q|| []).push(arguments)};
c[a].t=Date.now();u=o.createElement(v);u.async=1;u.src=e;
O=o.getElementsByTagName(v)[0];O.parentNode.insertBefore(u,O)
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

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
