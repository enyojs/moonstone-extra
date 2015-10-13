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
	* This takes action when the CustomizeCloseButton event is received. It accepts several event
	* properties, and in their absence resets each to its original value.
	*
	* Possible `ev` object members:
	*   x - (Number|String), positive or negative measurement to offset the X from its natural position.
	*       This value is automatically inverted in RtL mode.
	*   y - (Number|String), positive or negative measurement to offset the X from its natural position.
	*   properties {Object} An object containing key/value pairs to be `set` on the close button.
	*   For example, this can be used to set the `showing` property of the close button. If present
	*   and an object, the `styles` member will be iterated through and each style will be applied
	*   individually and those styles with a `null` value will be removed.
	*
	* Ex:
	*    this.doCustomizeCloseButton({parameters: {showing: false});
	*
	* @private
	*/
	handleCustomizeCloseButton: function (sender, ev) {
		var shiftX = ev.x,
			shiftY = typeof ev.y == 'number' ? dom.unit(ri.scale(ev.y), 'rem') : ev.y;

		switch (typeof shiftX) {
			case 'number':
				shiftX = dom.unit(ri.scale( this.rtl ? shiftX * -1 : shiftX ), 'rem');
				break;
			case 'string':
				if (this.rtl) {
					if (shiftX.indexOf('-') === 0) {
						shiftX = shiftX.substring(1);
					} else {
						shiftX = '-' + shiftX;
					}
				}
				break;
		}
		// Only apply changes that are present. (Undef means don't change me.) dom.transform preserves successive assignments.
		if (typeof shiftX != 'undefined') dom.transform(this, {translateX: shiftX});
		if (typeof shiftY != 'undefined') dom.transform(this, {translateY: shiftY});

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
