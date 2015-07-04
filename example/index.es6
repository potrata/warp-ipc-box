'use strict';

import warp from '@hp/warp';
import config from './config';

let app = warp({name: config.app.name});
app.bus.on('event', (msg, data) => console.log(msg, data));
app.useConfig(config.components);
app.start();

process.on('SIGINT', () => {
  app.destroy();
});
