'use strict';

import path from 'path';
import {fork} from 'child_process';
import {Component} from '@hp/warp';
import decorateBus from './lib/_bus-decorator';

export default class IPCBox extends Component {
  * init() {
    let _processSingleEntry = ([key, value]) => {
      let result = {};
      for (let copyIdx = 0; copyIdx < (value.copies || 1); copyIdx++) {
        Object.assign(result, {
          [`key-${copyIdx}`]: {
            path: value.path || path.join(this.config.appConfig.componentsRoot, key),
            config: Object.assign({ id: value.id(copyIdx) }, value.config(copyIdx))
          }
        });
      }
      return result;
    };

    this._componentData = Object.entries(this.config.components)
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

