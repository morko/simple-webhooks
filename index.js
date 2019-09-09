/**
 * This is a simple Webhook module that should work with e.g. GitHub.
 * 
 * To ensure the integrity of the message it is signed with a HMAC using a
 * sha-1 hashing algorithm. The signature is delivered in the
 * "X-Hub-Signature" header.
 * 
 * @module simple-webhook
 * @author Oskari Pöntinen
 */

/**
 * Node.js Server from http module.
 * @external Server
 * See
 * {@link https://nodejs.org/api/http.html#http_class_http_server|http.Server}
 */

/**
 * Node.js IncomingMessage from http module.
 * See
 * @external IncomingMessage
 * {@link https://nodejs.org/api/http.html#http_class_http_incomingmessage|http.IncomingMessage}
 */

/**
 * Node.js ServerResponse from http module.
 * @external ServerResponse
 * See
 * {@link https://nodejs.org/api/http.html#http_class_http_serverresponse|http.ServerResponse}
 */

/**
 * Callback funtion that gets called when Webhook server recieves data that is
 * valid.
 * 
 * @callback Job
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */

const WebhookServer = require('./src/server');
const WebhookClient = require('./src/client');
const digest = require('./src/digest');

module.exports = {
  WebhookServer,
  WebhookClient,
  digest
}