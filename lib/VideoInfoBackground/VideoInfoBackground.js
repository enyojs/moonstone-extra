require('moonstone-extra');

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control');

/**
* {@link moon.VideoInfoBackground} is a [control]{@link enyo.Control} that provides a
* stylized background for [components]{@link enyo.Component} placed in the
* [infoComponents]{@link moon.VideoPlayer#infoComponents} block of a {@link moon.VideoPlayer}.
* It is designed as a decorator, wrapping the components inside with the stylized background.
*
* Use the [orient]{@link moon.VideoInfoBackground#orient} property to set the orientation
* (`'left'` or `'right'`).
*
* For more details, see {@link moon.VideoPlayer}.
*
* @class moon.VideoInfoBackground
* @extends enyo.Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends moon.VideoInfoBackground.prototype */ {

	/**
	* @private
	*/
	name: 'moon.VideoInfoBackground',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-video-player-info-background',

	/**
	* @private
	* @lends moon.VideoInfoBackground.prototype
	*/
	published: {

		/**
		* Orientation of the control; valid values are `'left'` and `'right'`.
		*
		* @type {String}
		* @default 'left'
		* @public
		*/
		orient: 'left'
	},

	/**
	* @private
	*/
	initComponents: function() {
		Control.prototype.initComponents.apply(this, arguments);
		this.orientChanged();
	},

	/**
	* @private
	*/
	orientChanged: function() {
		this.addRemoveClass('right', this.orient != 'left');
		this.addRemoveClass('left', this.orient == 'left');
	}
});