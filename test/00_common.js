require("./setup");
const sinon = require("sinon");
const assert = require("chai").assert;
const exec = require("child_process").exec;

const { WebhookServer, WebhookClient } = require("../");
const secret = "secret_key";
const testData = "testData";

function randomString() {
  return Math.random()
    .toString(36)
    .substring(7);
}

describe("Webhook triggering", async function() {
  const server = new WebhookServer({
    secret: secret,
    job: sinon.spy()
  });

  const client = new WebhookClient({
    secret: secret
  });

  beforeEach(async function() {
    await server.listen();
  });

  afterEach(async function() {
    server.job.resetHistory();
    await server.close();
  });

  it("should get triggered with matching secrets", async function() {
    await client.trigger();
    sinon.assert.calledOnce(server.job);
  });

  it("should get triggered multiple times when using different requests", async function() {
    let callTimes = 10;
    for (let i = 0; i < callTimes; i++) {
      await client.trigger();
    }
    assert.equal(server.job.callCount, callTimes);
  });

  it("should not get triggered when secrets dont match", async function() {
    let bruteClient = new WebhookClient({ secret: randomString() });
    for (let i = 0; i < 1000; i++) {
      bruteClient.secret = randomString();
      await bruteClient.trigger("test");
    }
    assert.equal(server.job.callCount, 0);
  });
});
