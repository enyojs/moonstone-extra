require('moonstone-extra');

var
	kind = require('enyo/kind');

var
	$L = require('../i18n'),
	TooltipDecorator = require('moonstone/TooltipDecorator'),
	Tooltip = require('moonstone/Tooltip'),
	IconButton = require('moonstone/IconButton');

var buttonDescription = $L('Close this application');

/**
* `ApplicationCloseButton` may be added to {@link module:moonstone-extra/Panels~Panels}, or other
* full-screen controls. It includes basic positioning styles which may require adjustment for your
* particular usage. When activated, an event "onApplicationClose" is emitted. On its own, it has no
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
		{kind: Tooltip, content: buttonDescription, position: 'below'}
	],

	/**
	* @private
	*/
	handleButtonTap: function (sender, ev) {
		this.doApplicationClose();
	}
});
