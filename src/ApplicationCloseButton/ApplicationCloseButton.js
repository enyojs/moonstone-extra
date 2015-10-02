require('moonstone-extra');

/**
* Contains the declaration for the {@link module:moonstone-extra/ApplicationCloseButton~ApplicationCloseButton} kind.
* @module moonstone-extra/ApplicationCloseButton
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	ri = require('enyo/resolution');

var
	$L = require('../i18n'),
	TooltipDecorator = require('moonstone/TooltipDecorator'),
	Tooltip = require('moonstone/Tooltip'),
	IconButton = require('moonstone/IconButton');

var buttonDescription = $L('Close this application');

/**
* `ApplicationCloseButton` may be added to {@link module:moonstone-extra/Panels~Panels}, or other
* full-screen controls. It includes basic positioning styles which may require adjustment for your
* particular usage. When activated, an `onApplicationClose` event is emitted. On its own, it has no
* function; you must provide your own event handler to close your application. The recommended
* action to take with the event is `window.close()`, but you may also want to also do operations
* like save user work or close database connections.
*
* @class ApplicationCloseButton
* @extends module:moonstone/TooltipDecorator~TooltipDecorator
* @ui
* @public
*/
module.exports = kind({

	/**
	* @private
	*/
	name: 'moon.ApplicationCloseButton',

	/**
	* @private
	*/
	kind: TooltipDecorator,

	/**
	* @private
	*/
	classes: 'moon-application-close-button',

	/**
	* @private
	*/
	events: {
		onApplicationClose: ''
	},

	/**
	* @private
	*/
	components: [
		{name: 'button', kind: IconButton, icon: 'closex', small: true, accessibilityLabel: buttonDescription, ontap: 'handleButtonTap'},
		{kind: Tooltip, content: buttonDescription, floating: true, position: 'below'}
	],

	handlers: {
		onCustomizeCloseButton: 'handleCustomizeCloseButton'
	},

	/**
	* @private
	*/
	customizeCloseButton: function (properties) {
		var prop, style;

		if (properties && typeof properties == 'object') {
			for (prop in properties) {
				if (prop == 'styles' && typeof properties[prop] == 'object') {
					for (style in properties[prop]) {
						this.$.button.applyStyle(style, properties[prop][style]);
					}
				} else {
					this.$.button.set(prop, properties[prop]);
				}
			}
		}
	},

	/**
	* @private
	*/
	handleCustomizeCloseButton: function (sender, ev) {
		var shiftX = ev.x,
			shiftY = typeof ev.y == 'number' ? ev.y + 'px' : ev.y;

		switch (typeof shiftX) {
			case 'number':
				shiftX = dom.unit(ri.scale( this.rtl ? shiftX * -1 : shiftX ), 'rem');
				break;
			case 'string':
				if (this.rtl) {
					if (shiftX.indexOf('-') >= 0) {
						shiftX = shiftX.subString(1);
					} else {
						shiftX = '-' + shiftX;
					}
				}
				break;
		}
		dom.transform(this, {translateX: shiftX, translateY: shiftY});

		this.customizeCloseButton(ev.properties);
		return true;
	},

	/**
	* @private
	*/
	handleButtonTap: function (sender, ev) {
		this.doApplicationClose();
	}
});
