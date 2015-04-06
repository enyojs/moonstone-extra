'use strict';

var
	platform = require('enyo/platform'),
	dispatcher = require('enyo/dispatcher'),
	drag = require('enyo/drag');

exports = module.exports = require('./lib/options');
exports.version = '2.6.0-pre';

// Override the default holdpulse config to account for greater delays between keydown and keyup
// events in Moonstone with certain input devices.
drag.configureHoldPulse({
	frequency: 200,
	events: [{name: 'hold', time: 400}],
	resume: false,
	moveTolerance: 16,
	endHold: 'onMove'
});

/**
* Registers key mappings for webOS-specific device keys related to media control.
*
* @private
*/
if (platform.webos >= 4) {
	// Table of default keyCode mappings for webOS device
	dispatcher.registerKeyMap({
		415 : 'play',
		413 : 'stop',
		19  : 'pause',
		412 : 'rewind',
		417 : 'fastforward',
		461 : 'back'
	});
}

// ensure that these are registered
require('./lib/resolution');
require('./lib/fonts');