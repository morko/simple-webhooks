# simple-webhooks

Webhooks made simple!

Features

- Client and server side implementations.
- Protected against timing attacks.

## Quick start

```js
const { WebhookServer, WebhookClient } = require('simple-webhooks');

const server = new WebhookServer({
  secret: secret,
  port: 8338,
  job: (data) => console.log(`Received data: ${data}`);
});

const client = new WebhookClient({
  url: 'http://localhost',
  port: 8338,
  secret: secret
});

server.listen().then(() => {
  client.trigger('Hi');
})
```
