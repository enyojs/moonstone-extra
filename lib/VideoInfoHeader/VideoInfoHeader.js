require('moonstone-extra');

var
	kind = require('enyo/kind'),
	util = require('enyo/utils'),
	ri = require('enyo/resolution'),
	Control = require('enyo/Control'),
	Img = require('enyo/Image');

var
	Marquee = require('moonstone/Marquee'),
	MarqueeSupport = Marquee.Support,
	MarqueeText = Marquee.Text;

/**
* {@link moon.VideoInfoHeader} is a [control]{@link enyo.Control} that displays
* various information about a video. It is designed to be used within the
* [infoComponents]{@link moon.VideoPlayer#infoComponents} block of a {@link moon.VideoPlayer}.
*
* Example:
* ```javascript
* {
*	kind: 'moon.VideoInfoHeader',
*	title: 'Breaking Bad - Live Free Or Die',
*	description: 'As Walt deals with the aftermath of the Casa Tranquila explosion, '
*		+ 'Hank works to wrap up his investigation of Gus\' empire.',
*	components: [
*		{content: '3D'},
*		{content: 'Live'}
*	]
* }
* ```
*
* @class moon.VideoInfoHeader
* @extends enyo.Control
* @mixes moon.MarqueeSupport
* @ui
* @public
*/
module.exports = kind(
	/** @lends moon.VideoInfoHeader.prototype */ {

	/**
	* @private
	*/
	name: 'moon.VideoInfoHeader',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-video-info-header',

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
	* @lends moon.VideoInfoHeader.prototype
	*/
	published: {

		/**
		* Title of the `VideoInfoHeader`.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		title: '',

		/**
		* Main content of the `VideoInfoHeader`.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		description: '',

		/**
		* When `true`, the title text will have locale-safe uppercasing applied.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		uppercase: true,

		/**
		* @deprecated Replaced by [uppercase]{@link moon.VideoInfoHeader#uppercase}.
		*
		* Formerly defaulted to `true`, now defaults to `null` and will only have
		* an effect when explicitly set (for complete backward compatibility).
		*
		* @type {Boolean}
		* @default null
		* @public
		*/
		titleUpperCase: null,

		/**
		* URL of image file.
		*
		* @type {String}
		* @default null
		* @public
		*/
		src: null
	},

	/**
	* @private
	*/
	components: [
		{name: 'videoInfoText', classes: 'moon-video-info-text', components :[
			{kind: 'moon.MarqueeText', name: 'title', classes: 'moon-video-player-info-title'},
			{name: 'description', classes: 'moon-video-player-info-description'}
		]}
	],

	/**
	* @private
	*/
	bindings: [
		{from: 'description', to: '$.description.content'}
	],

	/**
	* @private
	*/
	create: function() {
		Control.prototype.create.apply(this, arguments);

		// FIXME: Backwards-compatibility for deprecated property - can be removed when
		// the contentUpperCase property is fully deprecated and removed. The legacy
		// property takes precedence if it exists.
		if (this.titleUpperCase !== null) this.uppercase = this.titleUpperCase;
		this.srcChanged();
		this.titleChanged();
	},

	/**
	* @private
	*/
	titleChanged: function() {
		this.$.title.set('content', this.get('uppercase') ? util.toUpperCase(this.get('title')) : this.get('title') );
	},

	/**
	* @private
	*/
	uppercaseChanged: function() {
		// FIXME: Backwards-compatibility for deprecated property - can be removed when
		// titleUpperCase is fully deprecated and removed.
		if (this.titleUpperCase != this.uppercase) this.titleUpperCase = this.uppercase;
		this.titleChanged();
	},

	/**
	* @private
	*/
	titleUpperCaseChanged: function() {
		if (this.uppercase != this.titleUpperCase) this.uppercase = this.titleUpperCase;
		this.uppercaseChanged();
	},

	/**
	* @private
	*/
	srcChanged: function() {
		var img = this.$.videoInfoImage;

		if (this.src) {
			if (img) {
				img.set('src', this.src);
			} else {
				img = this.createComponent({
					name: 'videoInfoImage',
					kind: Img,
					classes: 'moon-video-info-image',
					src: this.src,
					sizing: 'constrain',
					style: util.format('width: %.px; height: %.px', ri.scale(96), ri.scale(96)),
					addBefore: this.$.videoInfoText
				});
				if (this.generated) {
					img.render();
				}
			}
		} else if (img) {
			img.destroy();
		}
	}
});