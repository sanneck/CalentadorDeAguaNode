'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setGpioPower;

var _gpio = require('gpio');

var _gpio2 = _interopRequireDefault(_gpio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setGpioPower(gpioPin) {
  return new Promise(function (resolve, reject) {
    var pin = _gpio2.default.export(gpioPin, {
      direction: 'out',
      ready: function ready(err) {
        if (err) {
          reject(new Error('Could not set power gpio pin'));
        } else {
          pin.set(1, resolve);
        }
      }
    });
  });
}