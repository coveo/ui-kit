global.document = require('jsdom').jsdom('<body></body>');
global.window = document.defaultView;
global.navigator = window.navigator;
global.fetch = require('isomorphic-fetch');
global.location = window.location;