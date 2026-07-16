const {Headers, Request, Response} = require('cross-fetch/dist/node-ponyfill');

const fetch = jest.fn();

module.exports = {fetch, Headers, Request, Response, default: fetch};
