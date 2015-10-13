require('moonstone-extra');

/**
* Contains the declaration for the {@link module:moonstone-extra/ApplicationCloseButton~ApplicationCloseButton} kind.
* @module moonstone-extra/ApplicationCloseButton
*/

var
	kind = require('enyo/kind');

var
	$L = require('../i18n'),
	TooltipDecorator = require('moonstone/TooltipDecorator'),
	Tooltip = require('moonstone/Tooltip'),
	IconButton = require('moonstone/IconButton');

var buttonDescription = $L('Exit app');

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
	* Boolean indicating whether the tooltip is shown soon after the button is focused.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	autoShow: false,

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
		{name: 'button', kind: IconButton, icon: 'closex', small: true, ontap: 'handleButtonTap'},
		{kind: Tooltip, content: buttonDescription, position: 'below'}
	],

	/**
	* @private
	*/
	create: function () {
		this.inherited(arguments);
		this.autoShowChanged();
	},

	/**
	* @private
	*/
	autoShowChanged: function () {
		TooltipDecorator.prototype.autoShowChanged.apply(this, arguments);
		// Only add an accessibilityLabel to the button if we aren't displaying a tooltip, so the
		this.$.button.set('accessibilityLabel', this.autoShow ? null : buttonDescription);
	},

	/**
	* @private
	*/
	handleButtonTap: function (sender, ev) {
		this.doApplicationClose();
	}
});
