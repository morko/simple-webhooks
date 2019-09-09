const http = require("http");
const uuidv4 = require("uuid/v4");
const crypto = require("crypto");

const digest = require("./digest");
const logger = require("./logger");

class TimeoutError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
    this.name = "TimeoutError";
  }
}

function createRequest(opt) {
  opt = opt || {};

  if (!opt.url) throw new TypeError("invalid arguments");
  if (!opt.data) throw new TypeError("invalid arguments");
  if (!opt.secret) throw new TypeError("invalid arguments");
  if (!opt.port) throw new TypeError("invalid arguments");

  const options = {
    port: opt.port,
    method: "POST",
    headers: {
      "X-Hub-Signature": digest(opt.data, opt.secret),
      "X-SimpleWebhook-Delivery": uuidv4()
    }
  };
  const req = http.request(opt.url, options);
  req.write(opt.data);
  return req;
}

function sendRequest(req) {
  return new Promise((resolve, reject) => {
    req.once("response", res => {
      logger.debug("RESPONSE: " + res.statusCode);
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on("error", e => {
      reject(e);
    });

    req.on("timeout", () => {
      reject(new TimeoutError());
    });

    req.end();
  });
}

/**
 * Client for Webhook system. Can be used to trigger jobs at remote endpoints.
 *
 * Signs the
 */
class WebhookClient {
  /**
   * Creates a Webhook client that can be used to trigger the jobs at the
   * endpoint.
   *
   * @param {Object} opt - Options for the Webhook client.
   * @param {String} opt.secret - Shared secret between server and client for
   *    HMAC signature verification.
   * @param {String} [opt.url=http://localhost] - Hostname or IP of the Webhook
   *    endpoint.
   * @param {Number} [opt.port=8338] - Port of the Webhook server.
   * @param {String} [opt.data] - Default data to send with the request if no
   *    data is given to the `trigger` method.
   * @returns {WebhookClient} - The created client.
   */
  constructor(opt) {
    opt = opt || {};

    if (!opt.secret) throw new TypeError("invalid arguments");

    this.secret = opt.secret;

    this.url = opt.url || "http://localhost";
    this.port = opt.port || 8338;
    this.defaultData =
      opt.defaultData || crypto.randomBytes(64).toString("hex");
  }

  /**
   * Sends the request.
   * @param {string} data - Data to send within the request body.
   */
  async trigger(data) {
    data = data || this.defaultData;

    const request = createRequest({
      url: this.url,
      port: this.port,
      secret: this.secret,
      data: data
    });

    try {
      return sendRequest(request);
    } catch (err) {
      logger.error(err);
    }
  }
}

module.exports = WebhookClient;
