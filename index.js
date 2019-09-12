/**
 * This is a simple Webhook module that should work with e.g. GitHub.
 * 
 * To ensure the integrity of the message it is signed with a HMAC using a
 * sha-1 hashing algorithm. The signature is delivered in the
 * "X-Hub-Signature" header.
 * 
 * @module simple-webhooks
 * @author Oskari Pöntinen
 */

/**
 * Node.js Server from http module.
 * @external Server
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
 * {@link https://nodejs.org/api/http.html#http_class_http_serverresponse|http.ServerResponse}
 */

const WebhookServer = require('./src/server');
const WebhookClient = require('./src/client');
const digest = require('./src/digest');

module.exports = {
  /**
   * @type {WebhookServer}
   */
  WebhookServer,
  /**
   * @type {WebhookClient}
   */
  WebhookClient,
  digest
}