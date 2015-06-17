require('moonstone');

var
	kind = require('enyo/kind'),
	util = require('enyo/utils');

var
	Button = require('moonstone/Button'),
	AnimatedButtonSvg = require('./AnimatedButtonSvg');

/**
* {@link moon.AnimatedButton} is an {@link moon.Button} with Moonstone styling applied.
* The color of the button may be customized by specifying a background color.
*
* For more information, see the documentation on
* [Buttons]{@linkplain $dev-guide/building-apps/controls/buttons.html} in the
* Enyo Developer Guide.
*
* @class moon.AnimatedButton
* @extends enyo.AnimatedButton
* @mixes moon.MarqueeSupport
* @ui
* @public
*/
module.exports = kind(
	/** @lends moon.AnimatedButton.prototype */ {

	/**
	* @private
	*/
	name: 'moon.AnimatedButton',

	/**
	* @private
	*/
	kind: Button,

	/**
	* @private
	* @lends moon.AnimatedButton.prototype
	*/
	published: {
		duration: 400
	},

	/**
	* @private
	*/
	classes: 'moon-button-animated',

	handlers: {
		onSpotlightFocus: 'animateSpotlightFocus',
		onSpotlightBlur: 'animateSpotlightBlur'
	},

	bindings: [
		{from: 'duration', to: '$.animation.duration'}
	],

	/**
	* On creation, updates based on value of `this.small`.
	*
	* @private
	*/
	initComponents: function () {
		// Always add an SVG element, unless one already exists
		this.createChrome([
			{classes: 'moon-button-animated-frame', components: [
				{name: 'animation', kind: AnimatedButtonSvg, onEnd: 'animDone'}
			]}
		]);

		this.inherited(arguments);

		if (this.$.client) {
			this.$.client.addClass('button-client');
		} else {
			// No client? Drop all the components into a client frame to keep them safe from evil.
			this.createComponent({name: 'client', classes: 'button-client', isChrome: true});
			var i,
				newClient = this.$.client,
				children = this.getClientControls();
			for (i = 0; i < children.length; i++) {
				children[i].set('container', newClient);
			}
		}
	},
	animateSpotlightFocus: function () {
		this.$.animation.startFocus();
		var self = this;
		util.asyncMethod(function () {
			self.removeClass('spotlight');
		});
		this.startJob('textTransition', function () {
			self.addClass('nearly-spotlight');
		}, this.get('duration') / 2);
	},
	animateSpotlightBlur: function () {
		this.stopJob('textTransition');
		this.removeClass('nearly-spotlight');
		this.$.animation.startBlur();
	},
	animDone: function (sender, ev) {
		this.addRemoveClass('spotlight', ev.focused);
		this.removeClass('nearly-spotlight');
		return true;
	}
});
