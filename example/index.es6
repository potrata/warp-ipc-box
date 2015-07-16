'use strict';

import warp from 'node-warp';
import config from './config';

let app = warp({ name: config.app.name });
app.bus.on('event', (msg, data) => console.log(msg, data));
app.useConfig(config.components);
app.start();

process.once('SIGINT', () => {
  app.destroy().then(() => {
    process.exit(1)
  });
});
