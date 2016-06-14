/**
* Contains the declaration for the {@link module:moonstone-extra/VideoPlayer~VideoPlayer} kind.
* @module moonstone-extra/VideoPlayer
*/

require('moonstone-extra');

var
	dispatcher = require('enyo/dispatcher'),
	dom = require('enyo/dom'),
	gesture = require('enyo/gesture'),
	kind = require('enyo/kind'),
	util = require('enyo/utils'),
	Animator = require('enyo/Animator'),
	Control = require('enyo/Control'),
	EnyoHistory = require('enyo/History'),
	ContentAreaSupport = require('enyo/ContentAreaSupport'),
	ShowingTransitionSupport = require('enyo/ShowingTransitionSupport'),
	Signals = require('enyo/Signals'),
	Panels = require('enyo/LightPanels'),
	Video = require('enyo/Video');
var
	Spotlight = require('spotlight');

var
	DurationFmt = require('enyo-ilib/DurationFmt');

var
	$L = require('../i18n'),
	IconButton = require('moonstone/IconButton'),
	HistorySupport = require('moonstone/HistorySupport'),
	Marquee = require('moonstone/Marquee'),
	MarqueeSupport = Marquee.Support,
	MarqueeText = Marquee.Text,
	Spinner = require('moonstone/Spinner'),
	VideoFullscreenToggleButton = require('../VideoFullscreenToggleButton'),
	VideoTransportSlider = require('../VideoTransportSlider');

var VoiceReadout = require("enyo-webos/VoiceReadout");

var
	ARIA_READ_ALL = 1,
	ARIA_READ_INFO = 2,
	ARIA_READ_NONE = 3;

/**
* {@link module:moonstone/VideoPlayer~InfoBadge} is a simple kind used to display a badge
* containing channel information. It is the default kind for components added
* to {@link module:moonstone/VideoPlayer}.
*
* @class InfoBadge
* @extends module:enyo/Control~Control
* @ui
* @public
*/
var InfoBadge = kind(
	/** @lends module:moonstone/VideoPlayer~InfoBadge.prototype */ {

	/**
	* @private
	*/
	name: 'moon.InfoBadge',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	allowHtml: true,

	/**
	* @private
	*/
	classes: 'moon-video-badge-text badge-text-icon'
});

/**
* Fires when [disablePlaybackControls]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#disablePlaybackControls}
* is `true` and the user taps one of the [controls]{@link module:enyo/Control~Control}; may be handled to
* re-enable the controls, if desired. No event-specific information is sent with this event.
*
* @event module:moonstone-extra/VideoPlayer~VideoPlayer#onPlaybackControlsTapped
* @type {Object}
* @public
*/

/**
* Child controls may bubble this event to toggle the fullscreen state of the video player.
* No additional data needs to be sent with this event.
*
* @event module:moonstone-extra/VideoPlayer~VideoPlayer#onRequestToggleFullscreen
* @type {Object}
* @public
*/

/**
* Child controls may bubble this event to request an update to the current video position.
*
* @event module:moonstone-extra/VideoPlayer~VideoPlayer#onRequestTimeChange
* @type {Object}
* @property {Number} value - Requested time index.
* @public
*/

/**
* {@link module:moonstone-extra/VideoPlayer~VideoPlayer} is an HTML5 [video]{@glossary video} player control.  It wraps
* an {@link module:enyo/Video~Video} [object]{@glossary Object} to provide Moonstone-styled standard
* transport [controls]{@link module:enyo/Control~Control}, optional app-specific controls, and an information
* bar for displaying video information and player feedback.
*
* All of the standard HTML5 media [events]{@glossary event} bubbled from `enyo/Video` will
* also bubble from this control.
*
* Client [components]{@link module:enyo/Component~Component} added to the `components` block are rendered into
* the video player's transport control area, and should generally be limited to instances of
* {@link module:moonstone/IconButton~IconButton}. If more than two client components are specified, they will be
* rendered into an "overflow" screen, reached by activating a button to the right of the
* controls.
*
* Client components addded to the [infoComponents]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#infoComponents}
* block will be created as a header for the video.
*
* ```javascript
* var VideoPlayer = require('moonstone-extra/VideoPlayer');
*
* {
*		kind: VideoPlayer,
*		src: 'http://www.w3schools.com/html/mov_bbb.mp4',
*		components: [
*			// Custom icons for app-specific features
*			{kind: IconButton, src: 'assets/feature1.png', ontap: 'feature1'},
*			{kind: IconButton, src: 'assets/feature2.png', ontap: 'feature2'},
*			{kind: IconButton, src: 'assets/feature3.png', ontap: 'feature3'}
*		],
*		infoComponents: [
*			{kind: 'VideoHeaderBackground, components: [
*				{kind: VideoInfoHeader, ... }
*			]
*		]
* }
* ```
*
* @class VideoPlayer
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone-extra/VideoPlayer~VideoPlayer.prototype */ {

	/**
	* @private
	*/
	name: 'moon.VideoPlayer',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	mixins: [HistorySupport, ContentAreaSupport],

	/**
	* @private
	*/
	spotlight: true,

	// Fixme: When enyo-fit is used than the background image does not fit to video while dragging.
	/**
	* @private
	*/
	classes: 'moon-video-player enyo-unselectable',

	/**
	* @private
	*/
	events: {
		onPlaybackControlsTapped: ''
	},

	/**
	* @private
	* @lends module:moonstone-extra/VideoPlayer~VideoPlayer.prototype
	*/
	published: {

		/**
		* URL of HTML5 video file.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		src: '',

		/**
		* Array for setting multiple sources for the same video.
		*
		* @type {String[]}
		* @default null
		* @public
		*/
		sources: null,

		/**
		* A title for the video the player has currently loaded.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		title: null,

		/**
		* A [component]{@link module:enyo/Component~Component} definition block describing components to
		* be created as an information block above the video. Usually, this contains a
		* [moon/VideoInfoBackground]{@link module:moonstone-extra/VideoInfoBackground~VideoInfoBackground} with a
		* [moon/VideoInfoHeader]{@link module:moonstone-extra/VideoInfoHeader~VideoInfoHeader} in it.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		infoComponents: null,

		/**
		* A [component]{@link module:enyo/Component~Component} definition block describing components to
		* be created in the bottom left "premium" control space, to the left of the playback controls.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		leftComponents: null,

		/**
		* A [component]{@link module:enyo/Component~Component} definition block describing components to
		* be created in the bottom left "premium" control space, to the left of the playback controls.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		rightComponents: null,

		/**
		* If `true`, the video player is resized after metadata is loaded, based on the
		* [aspectRatio]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#aspectRatio} contained in the metadata. This
		* applies only to [inline]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#inline} mode (i.e., when
		* `inline` is `true`).
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		autoResize: false,

		/**
		* Video aspect ratio, specified as `'width:height'`, or `'none'`.  When an aspect ratio
		* is specified at render time, the player's height or width will be updated to respect
		* the ratio, depending on whether [fixedHeight]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#fixedHeight} is
		* `true` or `false`. If [autoResize]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#autoResize} is `true`, the
		* `aspectRatio` will be updated based on the metadata for the current video and the
		* player will be resized accordingly. This applies only to
		* [inline]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#inline} mode.
		*
		* @type {String}
		* @default '16:9'
		* @public
		*/
		aspectRatio: '16:9',

		/**
		* When `true`, the width will be adjusted at render time based on the observed height
		* and the aspect ratio. When `false` (the default), the height will be adjusted at
		* render time based on the observed width and the aspect ratio. This property is ignored
		* if [aspectRatio]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#aspectRatio} is `'none'` or a **falsy**
		* value.  In addition, this applies only to [inline]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#inline} mode.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		fixedHeight: false,

		/**
		* Amount of time (in milliseconds) after which control buttons are automatically hidden.
		*
		* @type {Number}
		* @default 5000
		* @public
		*/
		autoCloseTimeout: 5000,

		/**
		* Amount of time (in milliseconds) after which the title is automatically hidden.
		*
		* @type {Number}
		* @default 5000
		* @public
		*/
		autoHideTitleTimeout: 5000,

		/**
		* Duration of the video.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		duration: 0,

		/**
		* If `true`, playback starts automatically when video is loaded.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		autoplay: false,

		/**
		* If `false`, fullscreen video control overlays (info or transport) are not shown
		* or hidden automatically in response to `up` or `down` events.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoShowOverlay: true,

		/**
		* If `true`, the overlay will be shown in response to pointer movement (in addition to
		* `up` and `down` events).
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		shakeAndWake: false,

		/**
		* If `false`, the bottom slider/controls are not automatically shown or hidden in
		* response to `down` events.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoShowControls: true,

		/**
		* When `false`, the player starts in fullscreen mode; when `true`, it starts in
		* inline mode. As this is meant to be initialized on startup, fire the
		* [onRequestToggleFullscreen]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#onRequestToggleFullscreen}
		* event from a child control or call
		* [toggleFullscreen()]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#toggleFullscreen} to dynamically
		* toggle between fullscreen and inline mode.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		inline: false,

		/**
		* Amount of time (in seconds) to jump in response to jump buttons. This value is ignored
		* when [jumpStartEnd]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#jumpStartEnd} is `true`.
		*
		* @type {Number}
		* @default 30
		* @public
		*/
		jumpSec: 30,

		/**
		* If `true`, the "jump forward" and "jump back" buttons jump to the start and end of the
		* video, respectively.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		jumpStartEnd: false,

		/**
		* When `true`, popups opened from the video player's client controls are automatically
		* hidden.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoHidePopups: true,

		/**
		* If `false`, the progress bar is removed and any additional controls are moved
		* downward.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showProgressBar: true,

		/**
		* If `false`, the transport controls are removed, but the icon button area is kept.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showPlaybackControls: true,

		/**
		* When `true`, playback controls are hidden when the slider is hovered over.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		hideButtonsOnSlider: false,

		/**
		* If `true`, the slider is disabled and will not be enabled when video data has
		* loaded.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		disableSlider: false,

		/**
		* If `false`, the "jump forward" and "jump back" buttons are hidden.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showJumpControls: true,

		/**
		* When `true`, the fast-forward and rewind buttons are visible.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showFFRewindControls: true,

		/**
		* If `true`, the slider and playback controls are disabled. If the user taps the
		* controls, an
		* [onPlaybackControlsTapped]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#onPlaybackControlsTapped}
		* event will be bubbled.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		disablePlaybackControls: false,

		/**
		* When `true`, playback controls are only active when the video player has a valid
		* source URL and no errors occur during video loading.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		disablePlaybackControlsOnUnload: true,

		/**
		* If `false`, the Play/Pause control is hidden.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showPlayPauseControl: true,

		/**
		* If `false`, the video element is hidden.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showVideo: true,

		/**
		* When `true`, a spinner is automatically shown when video is in the play state but
		* is still loading/buffering.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoShowSpinner: true,

		/**
		* Source of image file to show when video isn't available or user has not yet tapped the
		* play button.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		poster: '',

		/**
		* If `false`, video player won't respond to remote control.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		handleRemoteControlKey: true,

		/**
		* Sliders will increase or decrease as much as this percentage value in either direction
		* when left or right key is pressed in 5-Way mode.
		*
		* @type {Number} or {String}
		* @default '5%'
		* @public
		*/
		knobIncrement: '5%',

		/**
		* Base URL for icons
		*
		* @private
		*/
		iconPath: 'images/video-player/',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		jumpBackIcon: 'skipbackward',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		rewindIcon: 'backward',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		playIcon: 'play',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		pauseIcon: 'pause',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		fastForwardIcon: 'forward',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		jumpForwardIcon: 'skipforward',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		moreControlsIcon: 'ellipsis',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		lessControlsIcon: 'arrowshrinkleft',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		inlinePlayIcon: 'play',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		inlinePauseIcon: 'pause',

		/**
		* Name of font-based icon or image file.
		*
		* @private
		*/
		inlineFullscreenIcon: 'fullscreen',

		/**
		* Default hash of playback states and their associated playback rates.
		* playbackRateHash: {
		*	fastForward: ['2', '4', '8', '16'],
		*	rewind: ['-2', '-4', '-8', '-16'],
		*	slowForward: ['1/4', '1/2'],
		*	slowRewind: ['-1/2', '-1']
		* }
		*
		* @private
		*/
		playbackRateHash: {
			fastForward: ['2', '4', '8', '16'],
			rewind: ['-2', '-4', '-8', '-16'],
			slowForward: ['1/4', '1/2'],
			slowRewind: ['-1/2', '-1']
		}
	},

	/**
	* @private
	*/
	handlers: {
		onRequestTimeChange: 'timeChange',
		onRequestToggleFullscreen: 'toggleFullscreen',
		onSpotlightKeyUp: 'spotlightKeyUpHandler',
		onSpotlightKeyDown: 'spotlightKeyDownHandler',
		onSpotlightUp: 'spotlightUpHandler',
		onSpotlightDown: 'spotlightDownHandler',
		onSpotlightLeft: 'spotlightLeftRightFilter',
		onSpotlightRight: 'spotlightLeftRightFilter',
		onSpotlightSelect: 'videoFSTapped',
		onresize: 'handleResize',
		onholdpulse: 'onHoldPulseHandler',
		onrelease: 'onReleaseHandler'
	},

	/**
	* @private
	*/
	eventsToCapture: {
		onSpotlightFocus: 'capturedFocus'
	},

	/**
	* @private
	*/
	bindings: [
		{from: 'src',                    to: '$.video.src'},
		{from: 'sources',                to: '$.video.sourceComponents'},
		{from: 'title',                  to: '$.title.content'},
		{from: 'playbackRateHash',       to: '$.video.playbackRateHash'},
		{from: 'poster',                 to: '$.video.poster'},
		{from: 'constrainToBgProgress',  to: '$.slider.constrainToBgProgress'},
		{from: 'elasticEffect',          to: '$.slider.elasticEffect'},
		{from: 'knobIncrement',          to: '$.slider.knobIncrement'},
		{from: 'showJumpControls',       to: '$.jumpForward.showing'},
		{from: 'showJumpControls',       to: '$.jumpBack.showing'},
		{from: 'showFFRewindControls',   to: '$.fastForward.showing'},
		{from: 'showFFRewindControls',   to: '$.rewind.showing'},
		{from: 'showPlayPauseControl',   to: '$.fsPlayPause.showing'},
		{from: 'showVideo',              to: '$.videoContainer.showing'}
	],

	/**
	* @private
	*/
	observers: {
		updateSource: ['src', 'sources']
	},

	/**
	* @private
	*/
	_isPlaying: false,

	/**
	* @private
	*/
	_canPlay: false,

	/**
	* @private
	*/
	_autoCloseTimer: null,

	/**
	* @private
	*/
	_currentTime: 0,

	/**
	* @private
	*/
	_panelsShowing: false,

	/**
	* @private
	*/
	contentAreas: [
		{target: 'leftPremiumPlaceHolder', content: 'leftComponents'},
		{target: 'rightPlaceHolder', content: 'rightComponents'},
		{target: 'infoClient', content: 'infoComponents'}
	],

	/**
	* @private
	*/
	components: [
		{kind: Signals, onPanelsShown: 'panelsShown', onPanelsHidden: 'panelsHidden', onPanelsHandleFocused: 'panelsHandleFocused', onPanelsHandleBlurred: 'panelsHandleBlurred', onFullscreenChange: 'fullscreenChanged', onkeyup:'remoteKeyHandler', onlocalechange: 'updateMoreButton'},
		{name: 'videoContainer', kind: Control, classes: 'moon-video-player-container', components: [
			{name: 'video', kind: Video, classes: 'moon-video-player-video',
				ontimeupdate: 'timeUpdate', onloadedmetadata: 'metadataLoaded', durationchange: 'durationUpdate', onloadeddata: 'dataloaded', onprogress: '_progress', onPlay: '_play', onpause: '_pause', onStart: '_start',  onended: '_stop',
				onFastforward: '_fastforward', onSlowforward: '_slowforward', onRewind: '_rewind', onSlowrewind: '_slowrewind',
				onJumpForward: '_jumpForward', onJumpBackward: '_jumpBackward', onratechange: 'playbackRateChange', ontap: 'videoTapped', oncanplay: '_setCanPlay', onwaiting: '_waiting', onerror: '_error'
			},
			{name: 'spinner', kind: Spinner, accessibilityLabel: $L('Loading'), classes: 'moon-video-player-spinner'}
		]},

		//* Fullscreen controls
		{name: 'fullscreenControl', kind: Control, classes: 'moon-video-player-fullscreen enyo-fit scrim', onmousemove: 'mousemove', ontap: 'videoFSTapped', components: [
			{name: 'playerControl', kind: Control, classes: 'moon-video-player-bottom', showing: false, components: [
				{name: 'titleContainer', kind: Control, classes: 'moon-video-player-title', mixins: [ShowingTransitionSupport, MarqueeSupport], hidingDuration: 1000, marqueeOnRender: true, components: [
					{name: 'title', kind: MarqueeText, classes: 'moon-video-player-title-text', accessibilityLive: 'off'},
					{name: 'infoClient', kind: Control, defaultKind: InfoBadge, classes: 'moon-video-player-info-badges', showing: false, mixins: [ShowingTransitionSupport], showingDuration: 500, tabIndex: -1}
				]},
				{name: 'sliderContainer', kind: Control, classes: 'moon-video-player-slider-frame', components: [
					{name: 'slider', kind: VideoTransportSlider, rtl: false, disabled: true, onSeekStart: 'sliderSeekStart', onSeek: 'sliderSeek', onSeekFinish: 'sliderSeekFinish',
						onEnterTapArea: 'onEnterSlider', onLeaveTapArea: 'onLeaveSlider', ontap: 'playbackControlsTapped'
					}
				]},
				{name: 'controls', kind: Control, classes: 'moon-video-player-controls-frame', ontap: 'resetAutoTimeout', components: [
					{name: 'leftPremiumPlaceHolder', kind: Control, classes: 'moon-video-player-premium-placeholder-left moon-hspacing'},
					{name: 'rightPremiumPlaceHolder', kind: Control, classes: 'moon-video-player-premium-placeholder-right', components: [
						{name: 'rightPlaceHolder', classes: 'moon-hspacing'},
						{name: 'moreButton', kind: IconButton, small: false, backgroundOpacity: 'translucent', ontap: 'moreButtonTapped', accessibilityLabel: $L('More'), classes: 'moon-video-player-more-button'}
					]},
					{classes: 'moon-video-player-controls-frame-center',components: [
						{name: 'controlsContainer', kind: Panels, reverseForRtl: true, index: 0, popOnBack: false, cacheViews: false, classes: 'moon-video-player-controls-container', components: [
							{name: 'trickPlay', kind: Control, ontap:'playbackControlsTapped', components: [
								{name: 'playbackControls', kind: Control, rtl: false, classes: 'moon-video-player-control-buttons', components: [
									{name: 'jumpBack',		kind: IconButton, small: false, backgroundOpacity: 'translucent', ontap: 'onjumpBackward', accessibilityLabel: $L('Previous')},
									{name: 'rewind',		kind: IconButton, small: false, backgroundOpacity: 'translucent', ontap: 'rewind', accessibilityLabel: $L('Rewind')},
									{name: 'fsPlayPause',	kind: IconButton, small: false, backgroundOpacity: 'translucent', ontap: 'playPause'},
									{name: 'fastForward',	kind: IconButton, small: false, backgroundOpacity: 'translucent', ontap: 'fastForward', accessibilityLabel: $L('Fast Forward')},
									{name: 'jumpForward',	kind: IconButton, small: false, backgroundOpacity: 'translucent', ontap: 'onjumpForward', accessibilityLabel: $L('Next')}
								]}
							]},
							{name: 'client', kind: Control, rtl: false,  classes: 'moon-video-player-more-controls'}
						]}
					]}
				]}
			]}
		]},
		//* Inline controls
		{name: 'inlineControl', kind: Control, classes: 'moon-video-player-inline-control', components: [
			{name: 'currPosAnimator', kind: Animator, onStep: 'currPosAnimatorStep', onEnd: 'currPosAnimatorComplete'},
			{name: 'bgProgressStatus', kind: Control, classes: 'moon-video-player-inline-control-bgprogress'},
			{name: 'progressStatus', kind: Control, classes: 'moon-video-player-inline-control-progress'},
			{kind: Control, classes: 'moon-video-player-inline-control-text', components: [
				{name: 'currTime', kind: Control, content: '00:00 / 00:00'}
			]},
			{name: 'ilPlayPause', kind: IconButton, ontap: 'playPause', classes: 'moon-icon-playpause'},
			{name: 'ilFullscreen', kind: VideoFullscreenToggleButton, small: true}
		]}
	],

	/**
	* @private
	*/
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.durfmt = new DurationFmt({length: 'medium', style: 'clock', useNative: false});
		this.updateSource();
		this.inlineChanged();
		this.autoShowControlsChanged();
		this.autoplayChanged();
		this.updateMoreButton();
		this.showPlaybackControlsChanged();
		this.showProgressBarChanged();
		this.jumpSecChanged();
		this.updatePlaybackControlState();
		this.retrieveIconsSrcOrFont(this.$.jumpBack, this.jumpBackIcon);
		this.retrieveIconsSrcOrFont(this.$.rewind, this.rewindIcon);
		this.retrieveIconsSrcOrFont(this.$.fsPlayPause, this.pauseIcon);
		this.retrieveIconsSrcOrFont(this.$.fastForward, this.fastForwardIcon);
		this.retrieveIconsSrcOrFont(this.$.jumpForward, this.jumpForwardIcon);
		this.retrieveIconsSrcOrFont(this.$.ilFullscreen, this.inlineFullscreenIcon);
		this.$.ilFullscreen.removeClass('moon-icon-exitfullscreen-font-style');
	},

	/**
	* @private
	*/
	checkIconType: function (icon) {
		var imagesrcRegex=/\.(jpg|jpeg|png|gif|svg)$/i;
		var iconType=imagesrcRegex.test(icon)?'image':'iconfont';
		return iconType;
	},

	/**
	* @private
	*/
	disablePlaybackControlsChanged: function () {
		this.updatePlaybackControlState();
	},

	/**
	* @private
	*/
	disablePlaybackControlsOnUnloadChanged: function () {
		this.updatePlaybackControlState();
	},

	/**
	* @private
	*/
	updatePlaybackControlState: function () {
		var disabled = this.disablePlaybackControls ||
			this._panelsShowing ||
			(this.disablePlaybackControlsOnUnload && (this._errorCode || (!this.getSrc() && !this.getSources()) ));
		this.updateSliderState();
		this.$.playbackControls.addRemoveClass('disabled', disabled);
		this.$.jumpBack.setDisabled(disabled);
		this.$.rewind.setDisabled(disabled);
		this.$.fsPlayPause.setDisabled(disabled);
		this.$.fastForward.setDisabled(disabled);
		this.$.jumpForward.setDisabled(disabled);
		this.$.ilPlayPause.setDisabled(disabled);
		var currentSpot = Spotlight.getCurrent();
		if (currentSpot && currentSpot.disabled) {
			if (this.isFullscreen() || !this.getInline()) {
				this.spotFSBottomControls();
			} else {
				Spotlight.spot(this.$.ilFullscreen);
			}
		}
	},

	/**
	* @private
	*/
	playbackControlsTapped: function () {
		if (this.disablePlaybackControls) {
			this.bubble('onPlaybackControlsTapped');
		}
	},

	/**
	* @private
	*/
	rendered: function () {
		Control.prototype.rendered.apply(this, arguments);
		//* Change aspect ratio based on initialAspectRatio
		this.aspectRatioChanged();
	},

	/**
	* @private
	*/
	showPlaybackControlsChanged: function (was) {
		this.$.trickPlay.set('showing', this.showPlaybackControls);
		this.$.moreButton.set('showing', this.showPlaybackControls && this.$.client.children.length);
		this.toggleSpotlightForMoreControls(!this.showPlaybackControls);
		this.$.client.addRemoveClass('moon-video-player-more-controls', this.showPlaybackControls);
	},

	/**
	* @private
	*/
	showProgressBarChanged: function (was) {
		this.$.sliderContainer.setShowing(this.showProgressBar);
	},

	/**
	* @private
	*/
	updateSource: function (old, value, source) {
		this._canPlay = false;
		this.set('_isPlaying', this.autoplay);
		this._errorCode = null;
		this.updatePlayPauseButtons();
		this.updateSpinner();
		this.updatePlaybackControlState();
		this._resetTime();

		// since src and sources are mutually exclusive, clear the other property
		// when one changes
		if (source === 'src') {
			this.sources = null;
		} else if (source === 'sources') {
			this.src = '';
		}
	},

	/**
	* Returns the underlying {@link module:enyo/Video~Video} control (wrapping the HTML5 video node).
	*
	* @returns {enyo/Video~Video} - An {@link module:enyo/Video~Video} control.
	* @public
	*/
	getVideo: function () {
		return this.$.video;
	},

	/**
	* @private
	*/
	playIconChanged: function () {
		this.updatePlayPauseButtons();
	},

	/**
	* @private
	*/
	pauseIconChanged: function () {
		this.updatePlayPauseButtons();
	},

	/**
	* @private
	*/
	inlinePlayIconChanged: function () {
		this.updatePlayPauseButtons();
	},

	/**
	* @private
	*/
	inlinePauseIconChanged: function () {
		this.updatePlayPauseButtons();
	},

	/**
	* @private
	*/
	moreControlsIconChanged: function () {
		this.updateMoreButton();
	},

	/**
	* @private
	*/
	lessControlsIconChanged: function () {
		this.updateMoreButton();
	},

	/**
	* @private
	*/
	autoplayChanged: function () {
		this.$.video.setAutoplay(this.autoplay);
		this.set('_isPlaying', this.autoplay);
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* @private
	*/
	jumpSecChanged: function () {
		this.$.video.setJumpSec(this.jumpSec);
	},

	/**
	* @private
	*/
	disableSliderChanged: function () {
		this.updateSliderState();
	},

	/**
	* @private
	*/
	updateSliderState: function () {
		//* this should be be called on create because default slider status should be disabled.
		var disabled =
			this.disableSlider ||
			this.disablePlaybackControls ||
			!this._loaded ||
			(this.disablePlaybackControlsOnUnload && (this._errorCode || (!this.getSrc() && !this.getSources()) ));
		this.$.slider.setDisabled(disabled);
		// We need an explicit call to showKnobStatus as moon.Slider's disabledChanged method
		// only handles hiding of the knob status. This behavior should not be changed in
		// disabledChanged, as the normal behavior of moon.Slider is to display the knob status
		// upon dragging, whereas moon.VideoPlayer is forcing the knob status to be shown when
		// the slider is visible.
		if (!disabled) {
			this.$.slider.showKnobStatus();
		}
	},

	/**
	* @private
	*/
	autoShowOverlayChanged: function () {
		this.autoShowControlsChanged();
		if (this.autoShowOverlay) {
			this.resetAutoTimeout();
		}
	},

	/**
	* @private
	*/
	autoShowControlsChanged: function () {
		if (this.$.playerControl.get('showing') && !this.autoShowControls) {
			this.$.playerControl.hide();
		}
		if (this.autoShowControls) {
			this.resetAutoTimeout();
		}
	},

	/**
	* @private
	*/
	inlineChanged: function () {
		// Force fullscreen
		this.addRemoveClass('enyo-fullscreen enyo-fit', !this.inline);
		// Padding-bottom contains inline controls
		this.addRemoveClass('moon-video-player-inline', this.inline);
		// show hide controls visibility
		this.$.inlineControl.setShowing(this.inline);
		this.$.fullscreenControl.setShowing(!this.inline);
		if (!this.inline) {
			this.$.inlineControl.canGenerate = false;
		}
		this.spotlight = !this.inline;
	},

	/**
	* Unloads the current video source, stopping all playback and buffering.
	*
	* @public
	*/
	unload: function () {
		this.$.video.unload();
		this._resetTime();
		this.set('_loaded', false);
		this.set('_isPlaying', false);
		this._canPlay = false;
		this._errorCode = null;
		this.src = '';
		this.sources = null;
		this.updatePlaybackControlState();
		this.updateSpinner();
	},
	showScrim: function (show) {
		this.$.fullscreenControl.addRemoveClass('scrim', !show);
	},

	/**
	* @private
	*/
	updateSpotability: function () {
		var spotState = this._panelsShowing ? false : (this._controlsShowing ? 'container' : true);
		this.updatePlaybackControlState();
		this.set('spotlight', spotState);
		this.$.leftPremiumPlaceHolder.spotlightDisabled = this._panelsShowing;
		this.$.rightPremiumPlaceHolder.spotlightDisabled = this._panelsShowing;
	},

	/**
	* @private
	*/
	panelsShown: function (sender, e) {
		if (this.isDescendantOf(e.panels)) return;
		this._panelsShowing = true;
		this._controlsShowing = false;
		this.updateSpotability();
		if (e.initialization) {
			return;
		}

		if ((this.isFullscreen() || !this.getInline()) && this.isOverlayShowing()) {
			this.hideFSControls();
			Spotlight.unspot();
		}
	},

	/**
	* @private
	*/
	panelsHidden: function (sender, e) {
		var current;
		if (this.isDescendantOf(e.panels)) return;

		this._panelsShowing = false;
		this.updateSpotability();

		current = Spotlight.getCurrent();
		if (!current || !current.isDescendantOf(this)) {
			Spotlight.spot(this);
		}
	},

	/**
	* @private
	*/
	panelsHandleFocused: function (sender, e) {
		this._controlsShowing = this.$.playerControl.get('showing');
		this.hideFSControls(true);
	},

	/**
	* @private
	*/
	panelsHandleBlurred: function (sender, e) {
		if (this.isLarge() && !this.isOverlayShowing()) {
			if (this._controlsShowing) {
				util.asyncMethod(this, 'showFSBottomControls');
			}
		}
	},

	/**
	* @private
	*/
	isLarge: function () {
		return this.isFullscreen() || !this.get('inline');
	},

	///// Fullscreen controls /////

	/**
	* @private
	*/
	_holdPulseThreadhold: 400,

	/**
	* @private
	*/
	_holding: false,

	/**
	* @private
	*/
	_sentHold: false,

	/**
	* @private
	*/
	spotlightLeftRightFilter: function (sender, e) {
		if (this._sentHold) return;

		return this.spotlightModal && e.originator === this;
	},

	/**
	* @private
	*/
	spotlightUpHandler: function(sender, e) {
		if (Spotlight.getCurrent() === this.$.slider) {
			this.hideFSBottomControls();
			if (this.allowBackKey) EnyoHistory.drop();
			return true;
		}
	},

	/**
	* @private
	*/
	spotlightDownHandler: function (sender, e) {
		var shouldHandleUpDown = !this._sentHold && this.isLarge() &&
			(e.originator === this || Spotlight.getParent(e.originator) === this);

		if (shouldHandleUpDown) {
			var current = Spotlight.getCurrent();

			if (current == this) {
				this.showFSBottomControls();
				return true;
			}
			else if (current.isDescendantOf(this.$.controls)) {
				if (this.allowBackKey) EnyoHistory.drop();
				this.hideFSBottomControls();
				return true;
			}
		}
	},

	/**
	* @private
	*/
	spotlightKeyUpHandler: function(sender, e) {
		this.resetAutoTimeout();
		gesture.drag.endHold();
	},

	/**
	* @private
	*/
	spotlightKeyDownHandler: function (sender, e) {
		if (e.keyCode == 32) {	// Play/Pause on spacebar.
			this.playPause();
			this.updatePlayPauseButtons();
		}
		if (!Spotlight.Accelerator.isAccelerating()) {
			gesture.drag.beginHold(e);
		}
	},

	/**
	* Returns `true` if any piece of the overlay is showing.
	*
	* @private
	*/
	isOverlayShowing: function () {
		return this.$.playerControl.get('showing');
	},

	/**
	* Resets the timeout, or wakes the overlay.
	*
	* @private
	*/
	mousemove: function (sender, e) {
		if (this.isOverlayShowing()) {
			this.resetAutoTimeout();
		} else if (this.shakeAndWake) {
			this.showFSControls();
		}
	},

	/**
	* Sets `this.visible` to `true` and clears hide job.
	*
	* @private
	*/
	showFSControls: function (sender, e) {
		this.showFSBottomControls();
	},

	/**
	* @private
	*/
	showBadges: function () {
		if (this.$.infoClient.children.length) {
			// Slide title up a bit, to make some room
			this.$.title.addClass('with-badges');
			this.$.infoClient.show();
		}
	},

	/**
	* @private
	*/
	hideBadges: function () {
		// Slide title back down in all cases.
		this.$.title.removeClass('with-badges');
		this.$.infoClient.hide();
	},

	/**
	* @private
	*/
	hideFSControls: function (spottingHandled) {
		if (this.isOverlayShowing()) {
			if (this.allowBackKey) {
				EnyoHistory.drop(1);
			}

			this.hideFSBottomControls();
		}
		if (!spottingHandled) {
			Spotlight.setPointerMode(false);
			Spotlight.spot(this);
		}
		this.stopJob('autoHide');
	},

	/**
	* Sets `this.visible` to `true` and clears hide job.
	*
	* @private
	*/
	showFSBottomControls: function (sender, e) {
		if (this.autoShowOverlay && this.autoShowControls) {
			this.resetAutoTimeout();
			this.showScrim(true);
			this.$.titleContainer.show();
			this.$.playerControl.setShowing(true);
			this.$.playerControl.resize();
			if (!this.showPlaybackControls) {
				//* Fixed index
				this.$.controlsContainer.set('index', 1);
			}

			//* Initial spot
			this.startJob('initial spot', function () {
				this.spotFSBottomControls();
			}, 100);

			this.$.slider.showKnobStatus();
			if (this.$.video.isPaused()) {
				this.updateFullscreenPosition();
			}
			// When controls are visible, set as container to remember last focused control
			this.set('spotlight', 'container');
			if (this.allowBackKey) {
				this.pushBackHistory();
			}
			this.startHideTitle();
		}
	},

	/**
	* Starts the countdown to eventually hide the title element.
	*
	* @private
	*/
	startHideTitle: function () {
		this.startJob('hideTitle', function () { this.$.titleContainer.hide(); }, this.autoHideTitleTimeout);
	},

	/**
	* Stops and resets the countdown so the title element doesn't hide.
	*
	* @private
	*/
	stopHideTitle: function () {
		this.stopJob('hideTitle');
	},

	/**
	* @private
	*/
	spotFSBottomControls: function () {
		if (this.showPlaybackControls) {
			if (this.$.controlsContainer.get('index') === 0) {
				if (Spotlight.spot(this.$.fsPlayPause) === false) {
					if (Spotlight.spot(this.$.fastForward) === false) {
						if (Spotlight.spot(this.$.jumpForward) === false) {
							Spotlight.spot(Spotlight.getFirstChild(this.$.controls));
						}
					}
				}
			} else {
				Spotlight.spot(Spotlight.getFirstChild(this.$.controlsContainer.getActivePanel()));
			}
		} else {
			var oTarget = Spotlight.getFirstChild(this.$.leftPremiumPlaceHolder);
			Spotlight.spot(oTarget);
		}
	},

	/**
	* Sets `this.visible` to `false`.
	*
	* @private
	*/
	hideFSBottomControls: function () {
		// When controls are hidden, set as just a spotlight true component,
		// so that it is spottable (since it won't have any spottable children),
		// and then spot itself
		this.set('spotlight', true);
		// Only spot the player if hiding is triggered from player control
		if (Spotlight.hasCurrent() && Spotlight.getParent(Spotlight.getCurrent()) === this) {
			Spotlight.spot(this);
		}
		if (this.autoHidePopups) {
			// Hide enyo/Popup-based popups (including moon/Popup)
			this.$.playerControl.waterfall('onRequestHide');
			// Hide moon/ContextualPopups
			this.$.playerControl.waterfall('onRequestHidePopup');
		}
		this.showScrim(false);
		this.$.playerControl.setShowing(false);
	},

	/**
	* @private
	*/
	videoFSTapped: function (sender, ev) {
		if (this.isFullscreen() || !this.getInline()) {
			if (ev.originator == this || ev.originator == this.$.fullscreenControl) {
				if (this.isOverlayShowing()) {
					this.hideFSControls();
				} else {
					this.showFSControls();
				}
				return true;
			}
		}
	},

	/**
	* @private
	*/
	hideFSControlsConditionally: function () {
		if (!this._playbackRate || this._playbackRate == '1') {
			this.hideFSControls();
		}
	},

	/**
	* @private
	*/
	resetAutoTimeout: function () {
		if (this.isFullscreen() || !this.getInline()) {
			this.startJob('autoHide', this.bindSafely('hideFSControlsConditionally'), this.getAutoCloseTimeout());
		}
	},

	/**
	* Toggles play/pause state based on `this.playing`.
	*
	* @private
	*/
	playPause: function (sender, e) {
		if (this._isPlaying) {
			this.pause(sender, e);
		} else {
			this.play(sender, e);
		}
		this.resetAutoTimeout();
		return true;
	},

	/**
	* @private
	*/
	onHoldPulseHandler: function (sender, e) {
		this.stopJob('autoHide');
		if (!this.jumpStartEnd) {
			if (e.holdTime > this._holdPulseThreadhold) {
				if (sender._sentHold !== true) {
					if (sender == this.$.jumpBack) {
						this.jumpToStart(sender, e);
						sender._sentHold = true;
					}
					else if (sender == this.$.jumpForward) {
						this.jumpToEnd(sender, e);
						sender._sentHold = true;
					}
					else this._sentHold = true;
					return true;
				}
			} else {
				if (sender == this.$.jumpBack || sender == this.$.jumpForward) {
					sender._holding = true;
					sender._sentHold = false;
				} else {
					this._holding = true;
					this._sentHold = false;
				}
			}
		}
	},

	/**
	* @private
	*/
	onReleaseHandler: function (sender, e) {
		if (sender == this.$.jumpBack || sender == this.$.jumpForward) {
			if (sender._sentHold && sender._sentHold === true) sender._sentHold = false;
		} else {
			if (this._sentHold && this._sentHold === true) this._sentHold = false;
		}
		this.resetAutoTimeout();
	},

	/**
	* @private
	*/
	onEnterSlider: function (sender, e) {
		if (this.hideButtonsOnSlider) {
			this.$.controls.setShowing(false);
		}
	},

	/**
	* @private
	*/
	onLeaveSlider: function (sender, e) {
		if (this.hideButtonsOnSlider && !this.$.slider.isDragging()) {
			this.$.controls.setShowing(true);
		}
	},

	/**
	* @private
	*/
	onjumpBackward: function (sender, e) {
		if (this.jumpStartEnd) {
			this.jumpToStart(sender, e);
		} else {
			if (!sender._holding || (sender._holding && sender._sentHold !== true)) {
				this.jumpBackward(sender, e);
			}
			sender._holding = false;
		}
	},

	/**
	* @private
	*/
	onjumpForward: function (sender, e) {
		if (this.jumpStartEnd) {
			this.jumpToEnd(sender, e);
		} else {
			if (!sender._holding || (sender._holding && sender._sentHold !== true)) {
				this.jumpForward(sender, e);
			}
			sender._holding = false;
		}
	},

	/**
	* @private
	*/
	sendFeedback: function (msg, params, persist, leftSrc, rightSrc) {
		params = params || {};
		this.$.slider.feedback(msg, params, persist, leftSrc, rightSrc);
	},

	////// Slider event handling //////

	/**
	* When seeking starts, pauses video.
	*
	* @private
	*/
	sliderSeekStart: function (sender, e) {
		this._isPausedBeforeDrag = this.$.video.isPaused();
		this.pause();
		return true;
	},

	/**
	* When seeking completes, plays video.
	*
	* @private
	*/
	sliderSeekFinish: function (sender, e) {
		if (e.value < this.duration - 1) {
			if (!this._isPausedBeforeDrag) {
				this.play();
			} else {
				this.pause();
			}
			this._isPausedBeforeDrag = this.$.video.isPaused();
		}
		if (!this.$.slider.isInPreview()) {
			this.$.controls.show();
		}
		this.setCurrentTime(e.value);
		return true;
	},

	/**
	* When seeking, sets video time.
	*
	* @private
	*/
	sliderSeek: function (sender, e) {
		this.setCurrentTime(e.value);
		return true;
	},

	/**
	* Programatically updates slider position to match `this.currentTime`/`this.duration`.
	*
	* @private
	*/
	updateFullscreenPosition: function () {
		if (this.$.slider.isDragging()) {
			return;
		}
		this.$.slider.setValue(this._currentTime);
	},

	/**
	* @private
	*/
	capture: function () {
		dispatcher.capture(this, this.eventsToCapture);
	},

	/**
	* @private
	*/
	release: function () {
		dispatcher.release(this);
	},

	/**
	* @private
	*/
	capturedFocus: function (sender, event) {
		Spotlight.spot(this);
		return true;
	},

	///// Inline controls /////

	/**
	* @private
	*/
	updateInlinePosition: function () {
		var percentComplete = this.duration ? Math.round(this._currentTime * 1000 / this.duration) / 10 : 0;
		this.$.progressStatus.applyStyle('width', percentComplete + '%');
		this.$.currTime.setContent(this.formatTime(this._currentTime) + ' / ' + this.formatTime(this.duration));
	},

	/**
	* @private
	*/
	videoTapped: function () {
		if (this.getInline() && !this.isFullscreen()) {
			this.playPause();
			this.updatePlayPauseButtons();
		}
	},

	/**
	* Toggles fullscreen state.
	*
	* @public
	*/
	toggleFullscreen: function () {
		if (this.isFullscreen()) {
			this.cancelFullscreen();
		} else {
			this.requestFullscreen();
		}
	},

	/**
	* @private
	*/
	fullscreenChanged: function (sender, e) {
		Spotlight.unspot();
		if (this.isFullscreen()) {
			this.$.ilFullscreen.undepress();
			this.$.ilFullscreen.removeClass('moon-icon-exitfullscreen-font-style');
			this.spotlight = true;
			this.spotlightModal = true;
			this.removeClass('inline');
			this.$.inlineControl.setShowing(false);
			this.$.fullscreenControl.setShowing(true);
			this.showFSControls();
			this.$.controlsContainer.resize();
			this.capture();
		} else {
			this.release();
			this.stopJob('autoHide');
			this.addClass('inline');
			this.$.inlineControl.setShowing(true);
			this.$.fullscreenControl.setShowing(false);
			Spotlight.spot(this.$.ilFullscreen);
			this.spotlight = false;
			this.spotlightModal = false;
		}
		this.updatePosition();
	},

	/**
	* Plays the video.
	*
	* @public
	*/
	play: function () {
		this.currTimeSync = true;
		this.set('_isPlaying', true);
		this.$.video.play();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Pauses the video.
	*
	* @public
	*/
	pause: function () {
		this.set('_isPlaying', false);
		this.$.video.pause();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Changes the playback speed based on the previous playback setting, by cycling through
	* the appropriate speeds.
	*
	* @public
	*/
	rewind: function () {
		this.set('_isPlaying', false);
		this.$.video.rewind();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Jumps to beginning of media [source]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#src} and sets
	* [playbackRate]{@link module:enyo/Video~Video#playbackRate} to `1`.
	*
	* @public
	*/
	jumpToStart: function () {
		this.$.video.jumpToStart();
		this.updatePlayPauseButtons();
		this.updateSpinner();
		if(this._isPlaying){
			this.$.video.play();
		}
	},

	/**
	* Jumps backward [jumpSec]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#jumpSec} seconds from the current time.
	*
	* @public
	*/
	jumpBackward: function () {
		this.$.video.jumpBackward();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Changes the playback speed based on the previous playback setting, by cycling through
	* the appropriate speeds.
	*
	* @public
	*/
	fastForward: function () {
		this.set('_isPlaying', false);
		this.$.video.fastForward();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Jumps to end of media [source]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#src} and sets
	* [playbackRate]{@link module:enyo/Video~Video#playbackRate} to `1`.
	*
	* @public
	*/
	jumpToEnd: function () {
		this.set('_isPlaying', false);
		if ( this.$.video.isPaused() ) {
			//* Make video able to go futher than the buffer
			this.$.video.play();
		}
		this.$.video.jumpToEnd();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Jumps forward [jumpSec]{@link module:moonstone-extra/VideoPlayer~VideoPlayer#jumpSec} seconds from the current time.
	*
	* @public
	*/
	jumpForward: function () {
		this.$.video.jumpForward();
		this.updatePlayPauseButtons();
		this.updateSpinner();
	},

	/**
	* Sets the current time in the video.
	*
	* @param {Number} val - The current time to set the video to, in seconds.
	* @public
	*/
	setCurrentTime: function (val) {
		this.$.video.setCurrentTime(val);
	},

	/**
	* Responds to `onRequestTimeChange` event by setting current video time.
	*
	* @private
	*/
	timeChange: function (sender, e) {
		this.setCurrentTime(e.value);
	},

	/**
	* Refreshes size of video player.
	*
	* @private
	*/
	handleResize: function () {
		this.aspectRatioChanged();
	},

	/**
	* Updates the height/width based on the video's aspect ratio.
	*
	* @private
	*/
	aspectRatioChanged: function () {
		// Case 5: Fixed size provided by user
		if (!this.inline || this.aspectRatio == 'none' || !this.aspectRatio) { return; }

		var videoAspectRatio = null,
			width = this.getComputedStyleValue('width'),
			height = this.getComputedStyleValue('height'),
			ratio = 1;

		videoAspectRatio = this.aspectRatio.split(':');

		// If fixedHeight is true, update width based on aspect ratio
		if (this.fixedHeight) {
			// Case 2: Automatic resize based on video aspect ratio (fixed height):
			// Case 4: Fixed aspect ratio provided by user (fixed-height):
			ratio = videoAspectRatio[0] / videoAspectRatio[1];
			this.applyStyle('width', dom.unit(parseInt(height, 10) * ratio, 'rem'));
		// If fixedHeight is false, update height based on aspect ratio
		} else {
			// Case 1: Automatic resize based on video aspect ratio (fixed width):
			// Case 3: Fixed aspect ratio provided by user (fixed-width):
			ratio = videoAspectRatio[1] / videoAspectRatio[0];
			this.applyStyle('height', dom.unit(parseInt(width, 10) * ratio, 'rem'));
		}
	},

	/**
	* @private
	*/
	updatePosition: function () {
		if (this.isFullscreen() || !this.getInline()) {
			this.updateFullscreenPosition();
		} else {
			this.updateInlinePosition();
		}
	},

	/**
	* Properly formats time.
	*
	* @private
	*/
	formatTime: function (val) {
		var hour = Math.floor(val / (60*60)),
			min = Math.floor((val / 60) % 60),
			sec = Math.floor(val % 60),
			time = {minute: min, second: sec};

		if (hour) {
			time.hour = hour;
		}
		return this.durfmt.format(time);
	},

	/**
	* Time formatting helper.
	*
	* @private
	*/
	padDigit: function (val) {
		return (val < 10) ? ('0'+val) : val;
	},

	/**
	* Switches play/pause buttons as appropriate.
	*
	* @private
	*/
	updatePlayPauseButtons: function () {
		if (this._isPlaying) {
			this.retrieveIconsSrcOrFont(this.$.fsPlayPause, this.pauseIcon);
			this.retrieveIconsSrcOrFont(this.$.ilPlayPause, this.inlinePauseIcon);
		} else {
			this.retrieveIconsSrcOrFont(this.$.fsPlayPause, this.playIcon);
			this.retrieveIconsSrcOrFont(this.$.ilPlayPause, this.inlinePlayIcon);
		}
	},

	/**
	* Retrieves icons through either `setSrc()` or `setIcon()`, depending on the icon type.
	*
	* @private
	*/
	retrieveIconsSrcOrFont:function (src, icon) {
		var iconType = this.checkIconType(icon);

		if (iconType == 'image') {
			src.set('icon', null);
			src.set('src', this.iconPath + icon);
		} else {
			src.set('src', null);
			src.set('icon', icon);
		}
	},

	/**
	* Turns spinner on or off, as appropriate.
	*
	* @private
	*/
	updateSpinner: function () {
		var spinner = this.$.spinner;
		if (this.autoShowSpinner && this._isPlaying && !this._canPlay && !this._errorCode) {
			spinner.start();
			this.addClass('spinner-showing');
		} else if (spinner.get('showing')) {
			this.removeClass('spinner-showing');
			spinner.stop();
		}
	},

	/**
	* @private
	*/
	autoShowSpinnerChanged: function () {
		this.updateSpinner();
	},

	/**
	* When `moreButton` is tapped, toggles visibility of player controls and extra
	* functionality.
	*
	* @private
	*/
	moreButtonTapped: function (sender, e) {
		if (this.$.controlsContainer.isTransitioning()) return true;

		// Need a delayed job here to account for the light panels transition. Can't use
		// `postTransition: 'updateMoreButton'` due to postTransition being scoped to the panel and
		// not the owner (this, us).
		this.startJob('changeMoreButton', this.updateMoreButton, this.$.controlsContainer.duration);

		var index = this.$.controlsContainer.get('index');
		if (index === 0) {
			this.toggleSpotlightForMoreControls(true);
			this.$.controlsContainer.next();
			this.stopHideTitle();
			this.$.titleContainer.show();
			this.showBadges();
		} else {
			this.toggleSpotlightForMoreControls(false);
			this.$.controlsContainer.previous();
			this.startHideTitle();
			this.hideBadges();
		}
	},

	/**
	* @private
	*/
	updateMoreButton: function () {
		var index = this.$.controlsContainer.get('index');
		if (index === 0) {
			this.retrieveIconsSrcOrFont(this.$.moreButton, this.moreControlsIcon);
		} else {
			this.retrieveIconsSrcOrFont(this.$.moreButton, this.lessControlsIcon);
		}
	},

	/**
	* @private
	*/
	toggleSpotlightForMoreControls: function (moreControlsSpottable) {
		this.$.playbackControls.spotlightDisabled = moreControlsSpottable;
		this.$.client.spotlightDisabled = !moreControlsSpottable;
	},

	///////// VIDEO EVENT HANDLERS /////////

	/**
	* Updates the video time.
	*
	* @private
	*/
	timeUpdate: function (sender, e) {
		var duration, currentTime;

		//* Update _this.duration_ and _this.currentTime_
		if (!e && e.target || e.currentTime === null) {
			return;
		}

		duration = e.duration;
		currentTime = e.currentTime;

		this.duration = duration;
		this._currentTime = currentTime;

		this.updatePosition();

		this.$.slider.timeUpdate(this._currentTime);

		// auto-hide when reaching either end
		if (currentTime === 0 || currentTime >= duration) {
			this.resetAutoTimeout();
		}
	},

	/**
	* Called when video successfully loads video metadata.
	*
	* @private
	*/
	metadataLoaded: function (sender, e) {
		//* Update aspect ratio based on actual video aspect ratio when autoResize is true.
		if (this.autoResize && this.$.video) {
			this.setAspectRatio(this.$.video.getAspectRatio());
		}
		this.durationUpdate(sender, e);
	},

	/**
	* @private
	*/
	durationUpdate: function (sender, e) {
		this.duration = this.$.video.getDuration();
		this._currentTime = this.$.video.getCurrentTime();

		this.$.slider.setMin(0);
		this.$.slider.setMax(this.duration);

		this.updatePosition();

		this.$.slider.durationUpdate(this.duration);
	},

	/**
	* @private
	*/
	_loaded: false,

	/**
	* @private
	*/
	dataloaded: function (sender, e) {
		this.set('_loaded', true);
		this.updateSliderState();
		this.durationUpdate(sender, e);
	},

	/**
	* @private
	*/
	_getBufferedProgress: function (node) {
		var bufferData = node.buffered,
			numberOfBuffers = bufferData.length,
			highestBufferPoint = 0,
			duration = node.duration || 0,
			endPoint = 0,
			i
		;

		if (duration === 0 || isNaN(duration)) {
			return {value: 0, percent: 0};
		}

		// Find furthest along buffer end point and use that (only supporting one buffer range for now)
		for (i = 0; i < numberOfBuffers; i++) {
			endPoint = bufferData.end(i);
			highestBufferPoint = (endPoint > highestBufferPoint) ? endPoint : highestBufferPoint;
		}
		return {value: highestBufferPoint, percent: highestBufferPoint/duration*100};
	},

	/**
	* We get this event while buffering is in progress.
	*
	* @private
	*/
	_progress: function (sender, e) {
		var buffered = this._getBufferedProgress(e.target);
		if (this.isFullscreen() || !this.getInline()) {
			this.$.slider.setBgProgress(buffered.value);
		} else {
			this.$.bgProgressStatus.applyStyle('width', buffered.percent + '%');
		}
	},

	/**
	* @private
	*/
	_resetTime: function () {
		this._currentTime = 0;
		this.duration = 0;
		this.updatePosition();
		this.$.slider.setBgProgress(0);
		this.$.bgProgressStatus.applyStyle('width', 0);
	},

	/**
	* @private
	*/
	_play: function (sender, e) {
		if(e.playbackRate != this.playbackRateHash.slowRewind[0] && e.playbackRate != this.playbackRateHash.slowForward[0]){
			this.sendFeedback('Play');
		}
	},

	/**
	* @private
	*/
	_pause: function (sender, e) {
		// Don't send pause feedback if we are rewinding
		if (e.target.playbackRate < 0) {
			return;
		}
		if (e.target.currentTime === 0) {
			this.sendFeedback('Stop', {}, true);
			return;
		}
		this.sendFeedback('Pause');
	},

	/**
	* @private
	*/
	_stop: function (sender, e) {
		this.pause();
		this.updatePlayPauseButtons();
		this.updateSpinner();
		this.sendFeedback('Stop');
	},

	/**
	* @private
	*/
	_fastforward: function (sender, e) {
		this.sendFeedback('Fastforward', {playbackRate: e.playbackRate}, true);
	},

	/**
	* @private
	*/
	_slowforward: function (sender, e) {
		this.sendFeedback('Slowforward', {playbackRate: e.playbackRate}, true);
	},

	/**
	* @private
	*/
	_rewind: function (sender, e) {
		this.sendFeedback('Rewind', {playbackRate: e.playbackRate}, true);
	},

	/**
	* @private
	*/
	_slowrewind: function (sender, e) {
		this.sendFeedback('Slowrewind', {playbackRate: e.playbackRate}, true);
	},

	/**
	* @private
	*/
	_jumpForward: function (sender, e) {
		this.sendFeedback('JumpForward', {jumpSize: e.jumpSize}, false);
	},

	/**
	* @private
	*/
	_jumpBackward: function (sender, e) {
		this.sendFeedback('JumpBackward', {jumpSize: e.jumpSize}, false);
	},

	/**
	* @private
	*/
	_waiting: function (sender, e) {
		this._canPlay = false;
		this.updateSpinner();
	},

	/**
	* @private
	*/
	_setCanPlay: function (sender, e) {
		this._canPlay = true;
		this.updateSpinner();
	},

	/**
	* @private
	*/
	playbackRateChange: function (sender, e) {
		this._playbackRate = e.playbackRate;
	},

	/**
	* @private
	*/
	_error: function (sender, e) {
		// Error codes in e.currentTarget.error.code
		// 1: MEDIA_ERR_ABORTED, 2: MEDIA_ERR_NETWORK, 3: MEDIA_ERR_DECODE,
		// 4: MEDIA_ERR_SRC_NOT_SUPPORTED
		this._errorCode = e.currentTarget.error.code;
		this.set('_loaded', false);
		this.set('_isPlaying', false);
		this._canPlay = false;
		this.$.currTime.setContent($L('Error'));
		this._stop();
		this.updateSpinner();
		this.updatePlaybackControlState();
	},

	/**
	* @private
	*/
	remoteKeyHandler: function (sender, e) {
		if (this.handleRemoteControlKey && !this.disablePlaybackControls) {
			var showControls = false;
			switch (e.keySymbol) {
			case 'play':
				this.play(sender, e);
				showControls = true;
				break;
			case 'pause':
				this.pause(sender, e);
				showControls = true;
				break;
			case 'rewind':
				if (this.showFFRewindControls) {
					this.rewind(sender, e);
					showControls = true;
				}
				break;
			case 'fastforward':
				if (this.showFFRewindControls) {
					this.fastForward(sender, e);
					showControls = true;
				}
				break;
			case 'stop':
				this.set('_isPlaying', false);
				this.jumpToStart();
				this.$.slider.setValue(0);
				this.sendFeedback('Stop');
				showControls = true;
				break;
			}
			if (showControls) {
				if(!this.$.playerControl.get('showing')) {
					this.showFSBottomControls();
				} else {
					this.resetAutoTimeout();
				}
			}
		}
		return true;
	},

	/**
	* @private
	*/
	backKeyHandler: function () {
		// if playerControls are visible, hide them
		if (this.isOverlayShowing()) {
			this.hideFSBottomControls();
		}
		// if playerControls are hidden, then the remaining action to "reverse" is fullscreen mode
		else if (this.isFullscreen()) {
			this.cancelFullscreen();
		}

		return true;
	},

	// Accessibility

	/**
	* Video title should be read only one time when player controls are shown. Further, the
	* infoClient controls should be read when they are shown. To coordinate both, this tri-value
	* property tracks which has been read and resets when the video is unloaded.
	*
	* @private
	*/
	_enableInfoReadOut: ARIA_READ_ALL,

	/**
	* @private
	*/
	ariaObservers: [
		{path: '_isPlaying', method: function () {
			var label, notify;
			if (this._isPlaying) {
				label = $L('Pause');
				notify = $L('Play');
			} else {
				label = $L('Play');
				notify = $L('Pause');
			}
			this.$.fsPlayPause.set('accessibilityLabel', label);
			this.$.ilPlayPause.set('accessibilityLabel', label);

			var delay = this.$.playerControl.getShowing() ? 0 : 500;
			this.startJob('notify playStatus', function () {
				VoiceReadout.readAlert(notify, !delay);
			}, delay);
		}},
		{path: '$.controlsContainer.index', method: function () {
			var index = this.$.controlsContainer.index,
				isControls = index === 0,
				label = isControls ? $L('More') : $L('Back');
			this.$.moreButton.set('accessibilityLabel', label);

			this.stopJob('focus infoClient');
			if (!isControls && this._enableInfoReadOut == ARIA_READ_INFO) {
				// you can't focus() a visibility: hidden control (which infoClient is due to
				// ShowingTransitionSupport) so we have to defer a moment to allow the mixin to
				// unhide it before focusing. Tried hooking this.$.infoClient.showing but the DOM
				// hadn't been updated yet to remove visibility at that point.
				this.startJob('focus infoClient', function () {
					this.$.infoClient.set("accessibilityAlert", true);
					this.set("_enableInfoReadOut", ARIA_READ_NONE);
				}, 100);
			}

			this.stopJob('focus moreButton');
			this.startJob('focus moreButton', function () {
				var node = this.$.moreButton.hasNode();
				if (node) {
					node.blur();
					node.focus();
				}
			}, 100);
		}},
		{path: '_loaded', method: function () {
			this.set('_enableInfoReadOut', this._loaded === true ? ARIA_READ_ALL : ARIA_READ_NONE);
		}},
		{path: ['src', 'sources'], method: function () {
			this.set('_enableInfoReadOut', ARIA_READ_ALL);
		}},
		{path: ['$.playerControl.showing', '_enableInfoReadOut'], method: function () {
			var alert = this.$.playerControl.showing && this._enableInfoReadOut == ARIA_READ_ALL;
			this.$.title.set('accessibilityAlert', alert);
			if (alert) {
				// skipping notifications since it'll bring us right back here
				this._enableInfoReadOut = ARIA_READ_INFO;
			} else {
				this.$.infoClient.set("accessibilityAlert", false);
			}
		}}
	]
});
