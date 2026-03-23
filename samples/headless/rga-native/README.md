# Headless RGA Native

This sample demonstrates how to use Headless RGA controllers in native JavaScript. 
This is a minimal example showing how to interact with controller to receive a generated response.
    
## Technology Stack
- **ESM JavaScript**

## Prerequisites
- Node.js 22+ 

NOTE: this is only required if you wish to run `npm start` and to test locally. The code itself is designed to run without node directly in a browser.

## Getting Started
1. Install dependencies:
    ```bash 
    pnpm install
    ```

2. Run the server:
    ```bash
    pnpm run start
    ```

3. Open your browser to `http://localhost:3000`


## Usage

When using the configuration from `getSampleSearchEngineConfiguration`, you will only be able to return a response for the query `what is ipx?`.