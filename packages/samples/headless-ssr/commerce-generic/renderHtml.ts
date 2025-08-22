import type {SearchStaticState} from './server.js';
import {getSharedStyles} from './styles.js';

export const renderHtml = (
  content: string,
  staticState: SearchStaticState
): string =>
  `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SSR Commerce Search with Atomic Components</title>    
        ${getSharedStyles()}
      </head>
      <body>
        <div id="app">${content}</div>
        <script>
            window.__STATIC_STATE__ = ${JSON.stringify(staticState)};
        </script>
        <script type="module" src="/client.js"></script>
      </body>
    </html>`;
