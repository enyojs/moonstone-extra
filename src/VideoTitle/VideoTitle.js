/**
* Contains the declaration for the {@link module:moonstone-extra/VideoTitle~VideoTitle} kind.
* @module moonstone-extra/VideoTitle
*/

require('moonstone-extra');

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control'),
	ShowingTransitionSupport = require('enyo/ShowingTransitionSupport');

var
	Marquee = require('moonstone/Marquee'),
	MarqueeText = Marquee.Text,
	MarqueeSupport = Marquee.Support;

/**
* {@link module:moonstone-extra/VideoTitle~VideoTitle} is a [control]{@link module:enyo/Control~Control}
* that displays the video's title.
* It is designed to be used within the
* [infoComponents]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#infoComponents} block of a {@link module:moonstone-extra/VideoPlayer~VideoPlayer}.
*
* Example:
* ```javascript
* var
*	VideoTitle = require('moonstone-extra/VideoTitle');
*
* {
*		kind: VideoTitle,
*		title: 'Breaking Bad - Live Free Or Die'
*	]
* }
* ```
*
* @class VideoTitle
* @extends module:enyo/Control~Control
* @mixes module:moonstone/MarqueeSupport~MarqueeSupport
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone-extra/VideoTitle~VideoTitle.prototype */ {

	/**
	* @private
	*/
	name: 'moon.VideoTitle',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-video-player-title',

	/**
	* @private
	*/
	mixins: [MarqueeSupport],

	/**
	* @private
	*/
	marqueeOnSpotlight: false,

	/**
	* @private
	*/
	marqueeOnRender: true,

	/**
	* @private
	* @lends module:moonstone-extra/VideoTitle~VideoTitle.prototype
	*/
	published: {

		/**
		* Title string of the `VideoTitle`.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		title: ''
	},

	/**
	* @private
	*/
	components: [
		{name: 'title', kind: MarqueeText, classes: 'moon-video-player-title-text'},
		{name: 'client', classes: 'moon-video-player-title-client'}
	],

	/**
	* @private
	*/
	bindings: [
		{from: 'title', to: '$.title.content'}
	]
});
