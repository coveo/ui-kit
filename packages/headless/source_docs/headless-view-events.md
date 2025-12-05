---
title: Log view events with Coveo UA
group: Usage
category: Usage Analytics
slug: usage/usage-analytics/log-view-events with-coveo-ua
---
# Log view events with Coveo UA

You can use Headless controllers to handle Search API requests and leverage [Coveo Analytics](https://docs.coveo.com/en/182/).
Headless-powered search UI components can automatically log search and click [events](https://docs.coveo.com/en/260/) for user interactions in your [search interfaces](https://docs.coveo.com/en/2741/).
These events
provide the data to power most [Coveo Machine Learning (Coveo ML)](https://docs.coveo.com/en/188/) [models](https://docs.coveo.com/en/1012/), except for [Content Recommendations (CR)](https://docs.coveo.com/en/1016/).

The output of a CR model depends on [view](https://docs.coveo.com/en/2949#view) events and the user’s action history.
Headless doesn’t
log these events for you, so you should ensure that you’re [sending view events](#send-view-events) for each page that you want to be able to recommend.

<dl><dt><strong>💡 TIP: Leading practice</strong></dt><dd>

Start sending view events as soon as you can to gather data that your CR models can learn from.
</dd></dl>

## Send view events

Use the [Coveo UA library](https://github.com/coveo/coveo.analytics.js) to send view events to Coveo UA.
You can load it from a [CDN link](#cdn) or install it as an [NPM package](#npm).

### CDN

The following code sample leverages the open source `coveoua.js` script to send a view event when a web page is loaded.

```html
<!DOCTYPE html>
<!-- Set `language` metadata for view events sent from this page. -->
<html lang="<PAGE_LANGUAGE>"> ①
<head>
  <!-- Set `title` metadata for view events sent from this page. -->
  <title>PAGE_TITLE</title> ②
  <!-- Import script to send view events and record actions history. -->
  <script type="text/javascript"
          src="https://static.cloud.coveo.com/coveo.analytics.js/2/coveoua.js">
  </script>
  <script>
    // Send view events.
    coveoua("init", "<ACCESS_TOKEN>", "<ANALYTICS_ENDPOINT>"); ③
    coveoua("send", "view", { ④
      contentIdKey: "<FIELD_NAME>", ⑤
      contentIdValue: "<FIELD_VALUE>", ⑥
      contentType: "<CONTENT_TYPE>", ⑦
      customData: {
        context_CONTEXT_KEY: "<CUSTOM_CONTEXT_VALUE>" ⑧
        // ... Additional custom context information ...
      }
    });
  </script>
  <!-- ... -->
</head>
<!-- ... -->
</html>
```

1. `<PAGE_LANGUAGE>`: The language identifier of the tracked page.
Coveo UA uses this value to populate the `language` metadata when sending view events.

   <dl><dt><strong>❗ IMPORTANT</strong></dt><dd>

   Coveo ML models are split into distinct submodels for [each language](https://docs.coveo.com/en/1803#what-languages-do-coveo-ml-models-support), so you should set the `lang` HTML attribute for each page that you’re tracking.
   </dd></dl>
2. `PAGE_TITLE`: The title of the tracked page.
Coveo UA uses this value to populate the `title` metadata when sending view events.
3. `<ACCESS_TOKEN>`: A [public API key](https://docs.coveo.com/en/1718#api-key-templates) or a valid [search token](https://docs.coveo.com/en/1346/) if the page requires user authentication (see [Choose and implement a search authentication method](https://docs.coveo.com/en/1369/), [Search token authentication](https://docs.coveo.com/en/56/), [Execute queries domain](https://docs.coveo.com/en/1707#execute-queries-domain), and [Analytics data domain](https://docs.coveo.com/en/1707#analytics-data-domain)).

   `<ANALYTICS_ENDPOINT>`: Your [organization analytics endpoint](https://docs.coveo.com/en/mcc80216#analytics-endpoint).

   * `https://<ORG_ID>.analytics.org.coveo.com` for a non-HIPAA organization
   * `https://<ORG_ID>.analytics.orghipaa.coveo.com` for a HIPAA organization

   Where `<ORG_ID>` is the unique identifier of your Coveo organization.
4. The `send` command returns a promise.
To send multiple events sequentially, use `await`:

   **Example**

   ```javascript
   async function sendEvents() {
     try {
       await coveoua("send", "view", { /* event data */ });
       await coveoua("send", "view", { /* event data */ });
     } catch (error) {
       console.error("Error sending events:", error);
     }
   }
   ```
5. `<FIELD_NAME>`: The name of a [field](https://docs.coveo.com/en/1833/) that can be used to uniquely and permanently identify the tracked page as an [item](https://docs.coveo.com/en/210/) in the [index](https://docs.coveo.com/en/204/).
The `@clickableuri` field is a good choice for pages in a public website, because you can retrieve a web page’s URL using JavaScript code.
6. `<FIELD_VALUE>`: The value of the `<FIELD_NAME>` field for the current tracked page.
If `<FIELD_NAME>` is set to `@clickableuri`, the `window.location.href` JavaScript function typically returns the matching `<FIELD_VALUE>` for the current page.
7. `<CONTENT_TYPE>`: (Optional) The [type of content](https://docs.coveo.com/en/1744/) being tracked.
8. <a name="user-context"></a>`CONTEXT_KEY`/`<CUSTOM_CONTEXT_VALUE>`: (Optional) The [user context](https://docs.coveo.com/en/3389/) key-value pairs to pass for more personalized recommendations.
When you log view events with Coveo UA, all user context key names must be prefixed with `context_`.

   **Example**

   In your search interface, the users are authenticated and you wrote a `getUserRole` function to return the user role (`customer`, `employee`, or `partner`) from the profile of the current user performing the query.
   Your custom context key is `userRole`, so you would pass it as follows when logging a view event:

   ```javascript
   context_userRole: getUserRole();
   ```

   <dl><dt><strong>📌 Note</strong></dt><dd>

   If you’re passing user context key-values along with view events, you’ll likely want to ensure that your recommendation interface [does so as well](https://docs.coveo.com/en/1934#leverage-user-context-data-in-a-recommendation-interface) when it sends [queries](https://docs.coveo.com/en/231/).
   </dd></dl>

### NPM

The Coveo UA library is also available as an [npm package](https://www.npmjs.com/package/coveo.analytics).
You can install it with the following command:

```bash
npm i coveo.analytics
```

You’ll want to have a module bundler (such as [webpack](https://webpack.js.org/)) installed and configured.

The following code sample references the Coveo UA library as an ESM module and sends a view event when a web page is loaded.

```javascript
import { CoveoAnalyticsClient } from 'coveo.analytics/modules';
const ua = new CoveoAnalyticsClient({token: '<ACCESS_TOKEN>', endpoint: '<ANALYTICS_ENDPOINT>'}); ①
ua.sendViewEvent({
  contentIdKey: '<FIELD_NAME>', ②
  contentIdValue: '<FIELD_VALUE>', ③
  contentType: '<CONTENT_TYPE>' ④
});
```

1. `<ACCESS_TOKEN>`: A [public API key](https://docs.coveo.com/en/1718#api-key-templates) or a valid [search token](https://docs.coveo.com/en/1346/) if the page requires user authentication (see [Choose and implement a search authentication method](https://docs.coveo.com/en/1369/), [Search token authentication](https://docs.coveo.com/en/56/), [Execute queries domain](https://docs.coveo.com/en/1707#execute-queries-domain), and [Analytics data domain](https://docs.coveo.com/en/1707#analytics-data-domain)).

   `<ANALYTICS_ENDPOINT>`: Your [organization analytics endpoint](https://docs.coveo.com/en/mcc80216#analytics-endpoint).

   * `https://<ORG_ID>.analytics.org.coveo.com` for a non-HIPAA organization
   * `https://<ORG_ID>.analytics.orghipaa.coveo.com` for a HIPAA organization

   Where `<ORG_ID>` is the unique identifier of your Coveo organization.
2. `<FIELD_NAME>`: The name of a [field](https://docs.coveo.com/en/1833/) that can be used to uniquely and permanently identify the tracked page as an [item](https://docs.coveo.com/en/210/) in the [index](https://docs.coveo.com/en/204/).
The `@clickableuri` field is a good choice for pages in a public site, because you can retrieve a web page’s URL using JavaScript code.
3. `<FIELD_VALUE>`: The value of the `<FIELD_NAME>` field for the current tracked page.
If `<FIELD_NAME>` is set to `@clickableuri`, the `window.location.href` JavaScript function typically returns the matching `<FIELD_VALUE>` for the current page.
4. `<CONTENT_TYPE>`: (Optional) The [type of content](https://docs.coveo.com/en/1744/) being tracked.