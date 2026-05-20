---
'@coveo/headless': minor
---

Added `proxyBaseUrl` support for GenAI streaming endpoints:

- **Answer API**: Answer API requests (`/rest/organizations/{org}/answer/v1/configs/{id}/generate`) now honor the existing `search.proxyBaseUrl` configuration, routing them through the same proxy server as search requests.
- **Search API CRGA**: The `/rest/organizations/{org}/machinelearning/streaming/{streamId}` endpoint now correctly honors the existing `search.proxyBaseUrl` configuration, which was previously ignored.
