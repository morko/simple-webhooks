require("./setup");
const sinon = require("sinon");
const assert = require("chai").assert;

const { WebhookServer, WebhookClient } = require("../");
const secret = "secret_key";
const testData = "testData";

function randomString() {
  return Math.random()
    .toString(36)
    .substring(7);
}
 
function slowFunction() {
  let result = 0;
  for (var i = Math.pow(10, 7); i >= 0; i--) {		
    result += Math.atan(i) * Math.tan(i);
  };
}

async function sleep(time) {
  return new Promise(resolve => setTimeout(() => resolve, time));
}

describe("Webhook triggering", async function() {

  this.timeout(20000);

  const server = new WebhookServer({
    secret: secret,
    job: () => slowFunction()
  });

  const client = new WebhookClient({
    secret: secret
  });

  sinon.spy(server, "job");

  beforeEach(async function() {
    await server.listen();
  });

  afterEach(async function() {
    server.job.resetHistory();
    await server.close();
  });

  it("should trigger with matching secrets", async function() {
    await client.trigger();
    sinon.assert.calledOnce(server.job);
  });

  it("should not trigger when secrets dont match", async function() {
    let bruteClient = new WebhookClient({ secret: randomString() });
    for (let i = 0; i < 10; i++) {
      bruteClient.secret = randomString();
      await bruteClient.trigger("test");
    }
    assert.equal(server.job.callCount, 0);
  });

  it("should trigger multiple times when using different requests", async function() {
    return new Promise((resolve, reject) => {

      let callTimes = 10;

      server.on("job-queue-empty", () => {
        if (server.job.callCount !== callTimes) {
          reject(new Error(
            `Mismatch in call times: ${server.job.callCount} !== ${callTimes}`
          ));
        }
        resolve();
      });

      for (let i = 0; i < callTimes; i++) {
        client.trigger();
      }
    });
  });
});
