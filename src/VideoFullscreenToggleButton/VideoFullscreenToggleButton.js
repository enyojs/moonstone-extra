/**
* Contains the declaration for the {@link module:moonstone-extra/VideoFullscreenToggleButton~VideoFullscreenToggleButton} kind.
* @module moonstone-extra/VideoFullscreenToggleButton
*/

require('moonstone-extra');

var
	kind = require('enyo/kind');

var
	$L = require('../i18n'),
	IconButton = require('moonstone/IconButton');

/**
* {@link module:moonstone-extra/VideoFullscreenToggleButton~VideoFullscreenToggleButton} is a specialized {@link module:moonstone/IconButton~IconButton};
* when placed inside a {@link module:moonstone-extra/VideoPlayer~VideoPlayer}, the button may be tapped to toggle
* the video player's fullscreen state.
*
* @class VideoFullscreenToggleButton
* @extends module:moonstone/IconButton~IconButton
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone-extra/VideoFullscreenToggleButton~VideoFullscreenToggleButton */ {

	/**
	* @private
	*/
	name: 'moon.VideoFullscreenToggleButton',

	/**
	* @private
	*/
	kind: IconButton,

	/**
	* @private
	*/
	icon : 'exitfullscreen',

	/**
	* @private
	*/
	small: false,

	/**
	* @private
	*/
	classes : 'moon-icon-exitfullscreen-font-style',

	/**
	* @private
	*/
	events: {
		/**
		* {@link module:moonstone-extra/VideoPlayer~VideoPlayer#onRequestToggleFullscreen}
		*/
		onRequestToggleFullscreen:''
	},

	/**
	* @private
	*/
	handlers: {
		/**
		* @fires module:moonstone-extra/VideoPlayer~VideoPlayer#onRequestToggleFullscreen
		*/
		ontap: 'doRequestToggleFullscreen'
	},

	// Accessibility

	/**
	* @private
	*/
	ariaObservers: [
		{path: 'icon', method: function () {
			if (this.icon === 'exitfullscreen') {
				this.set('accessibilityLabel', $L('original screen'));
			} else {
				this.set('accessibilityLabel', $L('full screen'));
			}
		}}
	]
});
