import {getSharedStyles} from './styles.js';
import type {SsrState} from './types.js';

// Inline (data URI) favicon — a coral rounded tile with a "C", so the sample
// needs no static asset pipeline.
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23F05245'/%3E%3Ctext x='50' y='70' font-size='62' font-family='sans-serif' font-weight='700' fill='white' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E";

export const renderHtml = (content: string, ssr: SsrState): string =>
  `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commerce SSR · Express</title>
        <link rel="icon" href="${FAVICON}">
        ${getSharedStyles()}
      </head>
      <body>
        <div id="app">${content}</div>
        <script>
            window.__SSR_STATE__ = ${JSON.stringify(ssr)};
        </script>
        <script type="module" src="/client.js"></script>
      </body>
    </html>`;
