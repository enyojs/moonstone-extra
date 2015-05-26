require('moonstone');

var
	kind = require('enyo/kind'),
	util = require('enyo/utils'),
	dom = require('enyo/dom');

var
	Button = require('moonstone/Button'),
	ButtonAnimatedSvg = require('./ButtonAnimatedSvg');

/**
* {@link moon.ButtonAnimated} is an {@link moon.Button} with Moonstone styling applied.
* The color of the button may be customized by specifying a background color.
*
* For more information, see the documentation on
* [Buttons]{@linkplain $dev-guide/building-apps/controls/buttons.html} in the
* Enyo Developer Guide.
*
* @class moon.ButtonAnimated
* @extends enyo.ButtonAnimated
* @mixes moon.MarqueeSupport
* @ui
* @public
*/
module.exports = kind(
	/** @lends moon.ButtonAnimated.prototype */ {

	/**
	* @private
	*/
	name: 'moon.ButtonAnimated',

	/**
	* @private
	*/
	kind: Button,

	/**
	* @private
	* @lends moon.ButtonAnimated.prototype
	*/
	published: {
		duration: 300,

		width: 150
	},

	/**
	* @private
	*/
	classes: 'moon-button-animated',

	handlers: {
		onSpotlightFocus: 'animateSpotlightFocus',
		onSpotlightBlur: 'animateSpotlightBlur',
		onEnd: 'animDone'
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
		this.createComponent(
			{name: 'spacer', classes: 'spacer', isChrome: true, content: 'x'}
		);
		this.createComponent(
			{classes: 'moon-button-animated-frame', isChrome: true, components: [
				{name: 'animation', kind: ButtonAnimatedSvg, isChrome: true}
			]}
		);

		this.inherited(arguments);

		if (this.$.client) {
			this.$.client.addClass('client-frame');
		} else {
			// No client? Drop all the components into a client frame to keep them safe from evil.
			this.createComponent({name: 'client', classes: 'client-frame enyo-children-inline', isChrome: true});
			var i,
				newClient = this.$.client,
				children = this.getClientControls();
			for (i = 0; i < children.length; i++) {
				children[i].set('container', newClient);
			}
		}
	},
	create: function () {
		this.inherited(arguments);
		this.widthChanged();
	},
	widthChanged: function (was) {
		var clientWidth = dom.unit(this.get('width'), 'rem'),
			client = this.$.client || this.getClientControls()[0];

		this.$.spacer.applyStyle('width', clientWidth);
		if (client) {
			client.applyStyle('width', clientWidth);
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
	}
});
