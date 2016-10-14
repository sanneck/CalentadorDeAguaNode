'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setGpioData;

var _child_process = require('child_process');

function setGpioData(gpioPin) {
  return new Promise(function (resolve, reject) {
    if (typeof gpioPin !== 'number') {
      reject(new Error('Gpio pin is not a number'));
    } else {
      var commands = ['modprobe w1-gpio', 'modprobe w1-therm', 'dtoverlay w1-gpio gpiopin=' + gpioPin];

      (0, _child_process.exec)(commands.join(' && '), function (err) {
        if (err) {
          reject(new Error('Could not set data gpio pin'));
        } else {
          resolve();
        }
      });
    }
  });
}