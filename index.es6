'use strict';

import path from 'path';
import {fork} from 'child_process';
import {Component} from 'node-warp';
import decorateBus from './lib/_bus-decorator';

export default class IPCBox extends Component {
  * init() {
    let {appConfig, components} = this.config;
    let _processSingleEntry = ([key, value]) => {
      return Object.assign({}, {
        [key]: {
          path: value.path || path.join(appConfig.componentsRoot, key),
          config: Object.assign({ id: value.id }, value.config)
        }
      });
    };

    this._componentData = Object.entries(components)
      .map(entry => _processSingleEntry(entry))
      .reduce((collector, obj) => {
        return Object.assign(collector, obj);
      }, {});
  }

  * start() {
    return yield this._startContainer();
  }

  * beforeDestroy() {
    if (this._fork && this._fork.connected) {
      yield this._bus.request(`_destroy.${this._fork.pid}`, {}, 3000);
    }
  }

  * destroy() {
    this._undecorateBus();
  }

  * _startContainer() {
    try {
      this._fork          = fork(__dirname + '/lib/_runner.js', [
        JSON.stringify(this.config.appConfig),
        JSON.stringify(this._componentData)
      ], { cwd: process.cwd() });
      this._fork.on('error', err => { throw err; });
      this._undecorateBus = decorateBus(this._bus, this._fork);
      yield this._bus.request(`_start.${this._fork.pid}`, {}, 3000);
    } catch (err) {
      this._fork = null;
      throw new Error(`Error starting child container: ${err}`);
    }
  }
}
