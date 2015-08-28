/**
* Contains the declaration for the {@link module:moonstone-extra/VideoInfoBackground~VideoInfoBackground} kind.
* @module moonstone-extra/VideoInfoBackground
*/

require('moonstone-extra');

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control');

/**
* {@link module:moonstone-extra/VideoInfoBackground~VideoInfoBackground} is a [control]{@link module:enyo/Control~Control} that provides a
* stylized background for [components]{@link module:enyo/Component~Component} placed in the
* [infoComponents]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#infoComponents} block of a {@link module:moonstone-extra/VideoPlayer~VideoPlayer}.
* It is designed as a decorator, wrapping the components inside with the stylized background.
*
* Use the [orient]{@link module:moonstone-extra/VideoInfoBackground~VideoInfoBackground#orient} property to set the orientation
* (`'left'` or `'right'`).
*
* For more details, see {@link module:moonstone-extra/VideoPlayer~VideoPlayer}.
*
* @class VideoInfoBackground
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone-extra/VideoInfoBackground~VideoInfoBackground.prototype */ {

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
	* @lends module:moonstone-extra/VideoInfoBackground~VideoInfoBackground.prototype
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
