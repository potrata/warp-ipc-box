'use strict';

import Bus from '@hp/warp/lib/bus.es6';

/**
 * @desc Inter-process Bus Implementation
 * @class IPCBus
 */
export default function decorate(bus, context = process) {
  let _originalEmit = bus.emit.bind(bus);

  function onMessage(payload) {
    if (payload && payload.type === 'event') {
      _originalEmit(payload.event, ...payload.data);
    }
  }

  function onError(err) {
    _originalEmit('error', `${context.pid}: ${err}`);
  }

  context.on('message', onMessage);
  context.on('error', onError);

  bus.emit = (event, ...args) => {
    return _originalEmit(event, ...args).then(listeners => {
      if (event.match(/^app\.([a-z]*)$/)) {
        return listeners;
      }
      context.send({ type: 'event', event, data: args });
      return listeners + 1;
    });
  };

  return function undecorate() {
    context.removeListener('error', onError);
    context.removeListener('message', onMessage);
    bus.emit = _originalEmit;
  };
}

