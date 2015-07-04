'use strict';
import path from 'path';

let config = {
  app: {
    name: 'ipc-box-example',
    data: {}
  },
  components: {}
};


config.components['ticker'] = {
  path: '@hp/warp-ticker',
  config: {
    id: 'ticker-local',
    event: `tick.master`,
    /** tick every second */
    interval: 10
  }
};

config.components['box-1'] = {
  path: '@hp/warp-ipc-box',
  config: {
    id: 'container-1',
    appConfig: {
      name: 'ptz-slave-1',
      componentsRoot: process.cwd() + '/components'
    },
    components: {
      'ticker': {
        path: '@hp/warp-ticker', copies: 2, id: (i) => `ticker-1-${i}`,
        config: (i) => {
          /** tick every 1.1, 2.2 seconds */
          return {
            event: `tick.1.${i}`,
            interval: (i + 1) * 11
          };
        }
      }
    }
  }
};

config.components['box-2'] = {
  path: '@hp/warp-ipc-box',
  config: {
    id: 'container-2',
    appConfig: {
      name: 'ptz-slave-2',
      componentsRoot: process.cwd() + '/components'
    },
    components: {
      'ticker': {
        path: '@hp/warp-ticker', copies: 2, id: (i) => `ticker-2-${i}`,
        config: (i) => {
          /** tick every 1.7, 1.9 seconds */
          return {
            event: `tick.2.${i}`,
            interval: (i * 2 + 17)
          };
        }
      }
    }
  }
};

export default config;
