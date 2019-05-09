import jsdom from "jsdom";
const { JSDOM } = jsdom;

const { window } = new JSDOM('<body></body>');
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.fetch = require('isomorphic-fetch');
global.location = window.location;
global.Blob = window.Blob;
global.navigator.sendBeacon = () => true;