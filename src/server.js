const http = require("http");
const crypto = require("crypto");
const uuidv4 = require("uuid/v4");
const EventEmitter = require('events');

const digest = require("./digest");
const logger = require("./logger");
const Queue = require("./queue");

/**
 * HTTP Webhook server that executes a job if the client uses the same secret
 * to sign the request.
 *
 * The signature is delivered in the X-Hub-Signature header.
 */
class WebhookServer extends EventEmitter {
  /**
   * Creates a HTTP Webhook server.
   *
   * @param {Object} opt - Options for the server.
   * @param {String} opt.secret - Shared secret between server and client for
   *    HMAC signature verification.
   * @param {Job} opt.job - The work to do when Webhook gets triggered.
   * @param {Number} [opt.port=8338] - Port of the Webhook server.
   * @returns {WebhookServer} - The created server.
   */
  constructor(opt) {
    super();

    opt = opt || {};

    if (!opt.secret) throw new TypeError("invalid arguments");
    if (!opt.job) throw new TypeError("invalid arguments");

    this.secret = opt.secret;
    this.job = opt.job;

    this.port = opt.port || 8338;

    this.httpServer = this.createServer();
    this.jobQueue = new Queue();
    this.currentJob = null;
  }

  createServer() {
    let httpServer = http.createServer(this.handleRequest.bind(this));

    httpServer.on("error", err => {
      logger.error(err);
    });

    return httpServer;
  }
  /**
   * Starts listening for the connections.
   *
   * @param {Number} port - Port to listen to.
   * @param {Promise} - Resolves when server is listening.
   */
  async listen(port) {
    port = port || this.port;
    return new Promise((resolve, reject) => {
      this.httpServer.once("error", error => {
        reject(error);
        this.close();
      });

      this.httpServer.once("listening", () => {
        resolve(port);
      });

      this.httpServer.listen(port);
    });
  }

  /**
   * Stops listening for new connections.
   * @param {Promise} - Resolves when server has stopped listening.
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (!this.httpServer.listening) {
        resolve();
        return;
      }

      this.httpServer.once("close", error => {
        resolve();
      });

      this.httpServer.close();
    });
  }

  async executeQueue() {
    if (!this.jobQueue.peek()) {
      this.emit("job-queue-empty");
      return;
    }
    this.currentJob = this.jobQueue.dequeue();
    logger.debug(`EXECUTE: ${this.currentJob.uuid}`)
    await this.currentJob.job(this.currentJob.data);
    this.currentJob = null;
    setTimeout(() => this.executeQueue(), 0);
  }

  async queueJob(job, data, uuid) {
    uuid = uuid || uuidv4();
    logger.debug(`QUEUE: ${uuid}`)
    const jobDescriptor = {
      job,
      data,
      uuid
    };
    this.jobQueue.enqueue(jobDescriptor);
    if (!this.currentJob) this.executeQueue();
  }

  /**
   * Handles the incoming requests.
   * @private
   */
  handleRequest(req, res) {

    let data = "";
    let uuid = "";

    req.on("data", chunk => {
      const localSig = digest(chunk, this.secret);
      const remoteSig = req.headers["x-hub-signature"];

      const remoteAddr = `${req.connection.remoteAddress}`;

      if (!remoteSig || localSig.length !== remoteSig.length) {
        logger.info(`BLOCKED: ${remoteAddr}`);
        return;
      }
      
      uuid = req.headers["x-simplewebhooks-delivery"] || "";

      if (
        crypto.timingSafeEqual(
          Buffer.from(remoteSig, "utf8"),
          Buffer.from(localSig, "utf8")
        )
      ) {
        logger.info(`ACCEPTED: ${remoteAddr}`);
        data += chunk;
      } else {
        logger.info(`BLOCKED: ${remoteAddr}`);
      }

    });

    req.on("end", () => {
      if (data) {
        setTimeout(() => this.queueJob(this.job, data, uuid), 1);
      }
      res.end();
    });

  }
}

module.exports = WebhookServer;
