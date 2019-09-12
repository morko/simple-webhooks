# simple-webhooks

**All versions prior 1.0.0 are experimental beta versions!**

Webhooks made simple!

Features

- Client and server side implementations.
- Protected against timing attacks.
- Sequential executing of jobs.

## 🚀 Quick start

1. **Install the package with npm.**

    ```sh
    npm install simple-webhooks
    ```

2. **Start developing.**

    Example of a Webhook server listening requests from port 8338.

    ```js
    // server.js
    const { WebhookServer } = require('simple-webhooks');

    const secret = 'shared secret between client and server';
    const port = 8338;

    const server = new WebhookServer({
      secret: secret,
      port: port,
      job: (data) => console.log(`Received data: ${data}`);
    });

    server.listen().then(() => {
      console.info(`Webhook server running at port ${port}`);
    })
    ```

    Example of a Webhook client that can trigger the jobs in the example server running on same host.

    ```js
    // client.js
    const { WebhookClient } = require('simple-webhooks');

    const secret = 'shared secret between client and server';
    const url = 'http://localhost';
    const port = 8338;

    const client = new WebhookClient({ secret, url, port });

    client.trigger('Hi');
    ```