# Atomic Hosted Page

The **Atomic Hosted Page** package provides a Web Component, `<atomic-hosted-ui>`, that integrates a Coveo Hosted Search Page into your web application. This component leverages the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/).

---

## Installation

### Via npm

To use the `<atomic-hosted-ui>` component in your project, install it via npm:

```bash
npm install @coveo/atomic-hosted-page
```

### Via CDN

Alternatively, you can use the component directly from the CDN:

```html
<script
  type="module"
  src="https://static.cloud.coveo.com/atomic-hosted-page/v1/atomic-hosted-page/atomic-hosted-page.esm.js"
></script>
```

---

## Usage

### Import and Use in JavaScript

1. Import the component into your application:

   ```javascript
   import '@coveo/atomic-hosted-page/dist/components/atomic-hosted-ui/atomic-hosted-ui.js';
   ```

2. Add the component to your HTML and initialize it with the required options:

   ```html
   <atomic-hosted-ui hosted-type="code"></atomic-hosted-ui>
   ```

   ```javascript
   const hostedUI = document.querySelector('atomic-hosted-ui');
   hostedUI.initialize({
     pageId: 'your-hosted-page-id',
     organizationId: 'your-organization-id',
     accessToken: 'your-access-token',
   });
   ```

### Using the CDN

1. Add the component script from the CDN to your HTML:

   ```html
   <script
     type="module"
     src="https://static.cloud.coveo.com/atomic-hosted-page/v1/atomic-hosted-page/atomic-hosted-page.esm.js"
   ></script>
   ```

2. Include the component in your HTML and initialize it:

   ```html
   <atomic-hosted-ui hosted-type="builder"></atomic-hosted-ui>
   <script>
     const hostedUI = document.querySelector('atomic-hosted-ui');
     hostedUI.initialize({
       pageId: 'example-page-id',
       organizationId: 'my-organization-id',
       accessToken: 'your-api-key',
     });
   </script>
   ```

---

## Properties

### `hosted-type`

- **Type:** `'trial' | 'builder' | 'code'`
- **Default:** `'code'`
- **Description:** Specifies the type of hosted search page to load:
  - `trial`: Loads a trial page.
  - `builder`: Loads a builder page.
  - `code`: Loads a custom code page.

---

## Initialization Options

The `initialize()` method requires the following options:

| Option           | Type   | Required | Description                                                                    |
| ---------------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `pageId`         | string | Yes      | The unique identifier of the hosted search page.                               |
| `organizationId` | string | Yes      | The Coveo organization ID.                                                     |
| `accessToken`    | string | Yes      | The API key or token used for authorization.                                   |
| `platformUrl`    | string | No       | The URL of the Coveo platform. Defaults to `https://platform.cloud.coveo.com`. |

---

## Example

### Basic Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Atomic Hosted Page Example</title>
    <script
      type="module"
      src="https://static.cloud.coveo.com/atomic-hosted-page/v1/atomic-hosted-page/atomic-hosted-page.esm.js"
    ></script>
  </head>
  <body>
    <atomic-hosted-ui hosted-type="builder"></atomic-hosted-ui>
    <script>
      const hostedUI = document.querySelector('atomic-hosted-ui');
      hostedUI.initialize({
        pageId: 'example-page-id',
        organizationId: 'my-organization-id',
        accessToken: 'your-api-key',
      });
    </script>
  </body>
</html>
```

---

## License

This project is licensed under the [Apache 2.0 License](LICENSE).
