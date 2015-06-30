require('moonstone-extra');

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	ri = require('enyo/resolution'),
	Control = require('enyo/Control'),
	Popup = require('enyo/Popup');

var
	Spotlight = require('spotlight');

var
	ilib = require('enyo-ilib');

var
	Slider = require('../Slider'),
	VideoFeedback = require('../VideoFeedback');

var
	defaultKnobIncrement = '5%';

/**
* The parameter [object]{@glossary Object} used when displaying a {@link moon.VideoFeedback}
* control.
*
* @typedef {Object} moon.VideoTransportSlider~FeedbackParameterObject
* @property {Number} [playbackRate] - The playback rate.
* @property {Number} [jumpSize] - The jump size.
* @public
*/

/**
* Fires when user starts dragging the video position knob. No additional data is
* provided in this event.
*
* @event moon.VideoTransportSlider#onSeekStart
* @type {Object}
* @public
*/

/**
* Fires when user changes the video position by tapping the bar.
*
* @event moon.VideoTransportSlider#onSeek
* @type {Object}
* @property {Number} value - The position to seek to.
* @public
*/

/**
* Fires when user stops dragging the video position knob.
*
* @event moon.VideoTransportSlider#onSeekFinish
* @type {Object}
* @property {Number} value - The position to seek to.
* @public
*/

/**
* Fires when cursor enters the tap area.
*
* @event moon.VideoTransportSlider#onEnterTapArea
* @type {Object}
* @public
*/

/**
* Fires when cursor leaves the tap area.
*
* @event moon.VideoTransportSlider#onLeaveTapArea
* @type {Object}
* @public
*/

/**
* {@link moon.VideoTransportSlider} extends {@link moon.Slider}, adding specialized
* behavior related to video playback.
*
* ```javascript
* {kind: 'VideoTransportSlider, value: 30}
* ```
*
* The [onSeekStart]{@link moon.VideoTransportSlider#onSeekStart} event is fired while
* the control knob is being dragged, the
* [onSeekFinish]{@link moon.VideoTransportSlider#onSeekFinish} event is fired when the
* drag finishes, and the [onSeek]{@link moon.VideoTransportSlider#onSeek} event is fired
* when the position is set by tapping the bar.
*
* @class moon.VideoTransportSlider
* @extends moon.Slider
* @ui
* @public
*/
module.exports = kind(
	/** @lends moon.VideoTransportSlider.prototype */ {

	/**
	* @private
	*/
	name: 'moon.VideoTransportSlider',

	/**
	* @private
	*/
	kind: Slider,

	/**
	* @private
	*/
	classes: 'moon-video-player-transport-slider',

	/**
	* @private
	* @lends moon.VideoTransportSlider.prototype
	*/
	published: {

		/**
		* Starting point of slider.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		rangeStart: 0,

		/**
		* Ending point of slider.
		*
		* @type {Number}
		* @default 100
		* @public
		*/
		rangeEnd: 100,

		/**
		* Controls the slider draw.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		syncTick: true,

		/**
		* When `true`, label is shown at the start and end positions.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showTickText: true,

		/**
		* When `true`, progress may extend past the hour markers.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		liveMode: false,

		/**
		* CSS classes to apply to background progress bar.
		*
		* @type {String}
		* @default 'bg-bar'
		* @public
		*/
		bgBarClasses: 'bg-bar',

		/**
		* CSS classes to apply to progress bar.
		*
		* @type {String}
		* @default 'bar-bar'
		* @public
		*/
		barClasses: 'bar-bar',

		/**
		* CSS classes to apply to popup label.
		*
		* @type {String}
		* @default 'popup-label'
		* @public
		*/
		popupLabelClasses: 'popup-label',

		/**
		* CSS classes to apply to knob.
		*
		* @type {String}
		* @default 'knob'
		* @public
		*/
		knobClasses: 'knob',

		/**
		* CSS classes to apply to tap area.
		*
		* @type {String}
		* @default 'taparea'
		* @public
		*/
		tapAreaClasses: 'taparea',

		/**
		* Color of value popup
		*
		* @type {String}
		* @default '#fff'
		* @public
		*/
		popupColor: '#4B4B4B',

		/**
		* Popup offset in pixels.
		*
		* @type {Number}
		* @default 144 - controls height(132) + margin (12)
		* @public
		*/
		popupOffset: 144,

		/**
		* Threshold value (percentage) for using animation effect on slider progress change.
		*
		* @type {Number}
		* @default 1
		* @public
		*/
		smallVariation: 1,

		/**
		* Popup height in pixels.
		*
		* @type {Number}
		* @default 48
		* @public
		*/
		popupHeight: 48,

		/**
		* Sliders will increase or decrease as much as knobIncrement in either direction
		* when left or right key is pressed in 5-Way mode.
		* If you'd like to use specific value instead of percentage,
		* give value as number to this property when you instanciate moon.VideoPlayer.
		*
		* @type {Number} or {String}
		* @default '5%'
		* @public
		*/
		knobIncrement: defaultKnobIncrement
	},

	/**
	* @private
	*/
	handlers: {
		onTimeupdate: 'timeUpdate',
		onresize: 'handleResize',
		onSpotlightKeyDown: 'spotlightKeyDownHandler'
	},

	/**
	* @private
	*/
	events: {
		onSeekStart: '',
		onSeek: '',
		onSeekFinish: '',
		onEnterTapArea: '',
		onLeaveTapArea: ''
	},

	/**
	* @private
	*/
	observers: {
		knobIncrementChanged: ['min', 'max']
	},

	/**
	* @private
	*/
	tickComponents: [
		{name: 'startWrapper', classes: 'indicator-wrapper start', components: [
			{name: 'beginTickText', classes: 'indicator-text left', content: '00:00'}
		]},
		{name: 'endWrapper', classes: 'indicator-wrapper end', components: [
			{name: 'endTickText', classes: 'indicator-text right', content: '00:00'}
		]}
	],

	/**
	* @private
	*/
	popupComponents: [
		{name: 'popup', kind: Popup, classes: 'moon-slider-popup above status-indicator', components: [
			{name: 'popupLabel', classes: 'moon-slider-popup-center' }
		]}
	],
	/**
	* @private
	*/
	popupLabelComponents: [
		{name: 'feedback', kind: VideoFeedback, showing:false},
		{name: 'popupLabelText', kind: Control}
	],

	/**
	* @private
	*/
	_previewMode: false,

	/**
	* @private
	*/
	createPopupComponents: function () {
		this.createComponents(this.popupComponents);
	},

	/**
	* @private
	*/
	create: function () {
		Slider.prototype.create.apply(this, arguments);
		this.$.popup.setAutoDismiss(false);		//* Always showing popup
		this.$.popup.captureEvents = false;		//* Hot fix for bad originator on tap, drag ...
		this.$.tapArea.onmove = 'preview';
		this.$.tapArea.onmousedown = 'mouseDownTapArea';
		this.$.tapArea.onmouseup = 'mouseUpTapArea';
		//* Extend components
		this.createTickComponents();
		this.createPopupLabelComponents();
		this.showTickTextChanged();
		this.knobIncrementChanged();

		this.durfmt = new ilib.DurFmt({length: 'medium', style: 'clock', useNative: false});
		this.$.beginTickText.setContent(this.formatTime(0));

		var loc = new ilib.Locale(),
			language = loc.getLanguage(),
			// Hash of languages and the additional % widths they'll need to not run off the edge.
			langWidths = {
				ja: 0.05,
				pt: 0.05
			};

		if (langWidths[language]) {
			//Todo. Instead of adjust begin or end postion, find proper way to conpensate language matter
			//move begin position to right as much as langWidths[language]
			//move end position to left as much as langWidths[language] );
		}
	},

	/**
	* @private
	*/
	createTickComponents: function () {
		this.createComponents(this.tickComponents, {owner: this, addBefore: this.$.tapArea});
	},

	/**
	* @private
	*/
	createPopupLabelComponents: function () {
		this.$.popupLabel.createComponents(this.popupLabelComponents, {owner: this});
		this.currentTime = 0;
	},

	/**
	* @private
	*/
	mouseDownTapArea: function (sender, e) {
		if (!this.disabled) {
			this.addClass('pressed');
		}
	},

	/**
	* @private
	*/
	mouseUpTapArea: function (sender, e) {
		this.removeClass('pressed');
	},

	/**
	* @private
	*/
	preview: function (sender, e) {
		if (!this.disabled && !this.dragging) {
			if (!this._previewMode) {
				this.startPreview();
			}
			var v = this.calcKnobPosition(e);
			this.currentTime = this.transformToVideo(v);
			this._updateKnobPosition(this.currentTime);
		}
	},

	/**
	* @private
	*/
	startPreview: function (sender, e) {
		this._previewMode = true;
		this.$.feedback.setShowing(false);
	},

	/**
	* @private
	*/
	endPreview: function (sender, e) {
		this._previewMode = false;
		this.currentTime = this._currentTime;
		this._updateKnobPosition(this.currentTime);
		if (this.$.feedback.isPersistShowing()) {
			this.$.feedback.setShowing(true);
		}
	},

	/**
	* @private
	*/
	isInPreview: function (sender, e) {
		return this._previewMode;
	},

	/**
	* @private
	*/
	handleResize: function () {
		Slider.prototype.handleResize.apply(this, arguments);
		this.updateSliderRange();
	},

	/**
	* @private
	*/
	updateSliderRange: function () {
		this.setRangeStart(this.min);
		this.setRangeEnd(this.max);

		this.updateKnobPosition(this.value);
	},

	/**
	* @private
	*/
	setMin: function () {
		Slider.prototype.setMin.apply(this, arguments);
		this.updateSliderRange();
	},

	/**
	* @private
	*/
	setMax: function () {
		Slider.prototype.setMax.apply(this, arguments);
		this.updateSliderRange();
	},

	/**
	* @private
	*/
	setRangeStart: function (val) {
		this.rangeStart = this.clampValue(this.getMin(), this.getMax(), val);
		this.rangeStartChanged();
	},

	/**
	* @private
	*/
	setRangeEnd: function (val) {
		this.rangeEnd = this.clampValue(this.getMin(), this.getMax(), val);
		this.rangeEndChanged();
	},

	/**
	* @private
	*/
	showTickTextChanged: function () {
		this.$.beginTickText.setShowing(this.getShowTickText());
		this.$.endTickText.setShowing(this.getShowTickText());
	},

	/**
	* @private
	*/
	rangeStartChanged: function () {
		this.updateInternalProperty();
		var p = this._calcPercent(this.rangeStart),
			property = 'margin-left';
		if (this.liveMode) {
			property = 'padding-left';
		}
		this.$.bar.applyStyle(property, p + '%');
		this.$.bgbar.applyStyle(property, p + '%');
	},

	/**
	* @private
	*/
	rangeEndChanged: function () {
		this.updateInternalProperty();
	},

	/**
	* @private
	*/
	updateInternalProperty: function () {
		this.updateScale();
		this.progressChanged();
		this.bgProgressChanged();
	},
	//* Sets value of hidden variable, _scaleFactor_.
	updateScale: function () {
		this.scaleFactor = (this.rangeEnd-this.rangeStart)/(this.max-this.min);
	},

	/**
	* @private
	*/
	calcPercent: function (val) {
		return (this.calcRatio(val) * 100) * this.scaleFactor;
	},

	/**
	* @private
	*/
	_calcPercent: function (val) {
		return this.calcRatio(val) * 100;
	},

	/**
	* @private
	*/
	calcVariationRatio: function (val) {
		return (val - this.value) / (this.max - this.min);
	},

	/**
	* @private
	*/
	calcVariationPercent: function (val) {
		return this.calcVariationRatio(val) * 100;
	},

	/**
	* @private
	*/
	updateKnobPosition: function (val) {
		if (!this.dragging && this.isInPreview()) { return; }
		this._updateKnobPosition(val);
	},

	/**
	* Calculate slider knob's position and apply it.
	*
	* @private
	*/
	_updateKnobPosition: function (val) {
		// Setting the knob position 1 tick before the last frame allows the video frame to update before shutting off.
		var p = this.clampValue(this.min, this.max - 1 , val);
		p = this._calcPercent(p);
		var slider = this.inverseToSlider(p);
		this.$.knob.applyStyle('left', slider + '%');
		if (Spotlight.getCurrent() === this) {
			this.$.popupLabelText.setContent(this.formatTime(val));
		} else if (this.currentTime !== undefined) {
			this.$.popupLabelText.setContent(this.formatTime(this.currentTime));
		}
	},

	/**
	* @private
	*/
	inverseToSlider: function (percent) {
		var val = this.scaleFactor * percent + this._calcPercent(this.rangeStart);
		return val;
	},

	/**
	* @private
	*/
	transformToVideo: function (val) {
		return (val - this.rangeStart) / this.scaleFactor;
	},

	/**
	* Using mouse cursor or 5-way key, you can point some spot of video
	* If you tap or press enter on slider, video will play that part.
	*
	* @private
	*/
	playCurrentKnobPosition: function (e) {
		var v = this.calcKnobPosition(e) || this._value;

		this.mouseDownTapArea();
		this.startJob('simulateClick', this.mouseUpTapArea, 200);

		v = this.transformToVideo(v);
		this.sendSeekEvent(v);

		if (this.isInPreview()) {
			//* This will move popup position to playing time when preview move is end
			this._currentTime = v;
		}
	},

	/**
	* If user presses `this.$.tapArea`, seeks to that point.
	*
	* @private
	*/
	tap: function (sender, e) {
		if (this.tappable && !this.disabled) {
			this.playCurrentKnobPosition(e);
			return true;
		}
	},

	/**
	* If user presses enter on `this.$.tapArea`, seeks to that point.
	*
	* @private
	*/
	spotlightKeyDownHandler: function (sender, e) {
		if (this.tappable && !this.disabled && event.keyCode == 13) {
			this.playCurrentKnobPosition(e);
			return true;
		}
	},

	/**
	* @private
	*/
	setValue: function (val) {
		this.currentTime = val;
		if(Math.abs(this.calcVariationPercent(val)) > this.smallVariation) {
			Slider.prototype.setValue.apply(this, arguments);
		} else {
			this._setValue(val);
			this._updateBeginText(val);
		}
	},

	/**
	* @private
	*/
	spotFocused: function (sender, e) {
		Slider.prototype.spotFocused.apply(this, arguments);
		// this._value will be used for knob positioning.
		if (!Spotlight.getPointerMode()) {
			this._value = this.get('value');
			this.spotSelect();
		}

		this.startPreview();
		if (!this.disabled) {
			this.addClass('visible');
			//fires enyo.VideoTransportSlider#onEnterTapArea
			this.doEnterTapArea();
		}
	},

	/**
	* @private
	*/
	spotBlur: function () {
		if (!this.dragging) {
			if (this.$.knob) {
				this.$.knob.removeClass('spotselect');
			}
			this.selected = false;
		}
		this.removeClass('visible');
		this.endPreview();
		//fires enyo.VideoTransportSlider#onLeaveTapArea
		this.doLeaveTapArea();

	},

	/**
	* @private
	*/
	knobIncrementChanged: function () {
		var increment = this.knobIncrement || defaultKnobIncrement;

		if (typeof increment == 'number' && increment > 0) {
			this._knobIncrement = increment;
		} else {
			if (typeof increment != 'string' || increment.charAt(increment.length - 1) == '%') {
				increment = defaultKnobIncrement;
			}
			this._knobIncrement = (this.max - this.min) * increment.substr(0, increment.length - 1) / 100;
		}
	},

	/**
	* @private
	*/
	spotLeft: function (sender, e) {
		if (this.selected && this._value > this.min) {
			// If in the process of animating, work from the previously set value
			var v = this.clampValue(this.min, this.max, this._value || this.getValue());
			v = (v - this._knobIncrement < this.min) ? this.min : v - this._knobIncrement;
			this._updateKnobPosition(v);
			this.set('_value', v);			
		}
		return true;
	},

	/**
	* @private
	*/
	spotRight: function (sender, e) {
		if (this.selected && this._value < this.max - 1) {
			var v = this.clampValue(this.min, this.max, this._value || this.getValue());
			v = (v + this._knobIncrement > this.max) ? this.max - 1 : v + this._knobIncrement;
			this._updateKnobPosition(v);
			this.set('_value', v);
		}
		return true;
	},

	/**
	* @private
	*/
	_updateBeginText: function (val) {
		var v = this.clampValue(this.min, this.max, val);
		this.$.beginTickText.setContent(this.formatTime(v));
	},

	/**
	* If `dragstart`, bubbles [onSeekStart]{@link moon.VideoTransportSlider#onSeekStart}
	* event.
	*
	* @fires moon.VideoTransportSlider#onSeekStart
	* @private
	*/
	dragstart: function (sender, e) {
		if (this.disabled) {
			return; // return nothing
		}
		if (e.horizontal) {
			// the call to the super class freezes spotlight, so it needs to be unfrozen in dragfinish
			var dragstart = Slider.prototype.dragstart.apply(this, arguments);
			if (dragstart) {
				this.doSeekStart();
			}
			return true;
		}

		return true;
	},

	/**
	* If `drag`, bubbles [onSeek]{@link moon.VideoTransportSlider#onSeek} event and
	* overrides parent `drag` handler.
	*
	* @private
	*/
	drag: function (sender, e) {
		if (this.dragging) {
			var v = this.calcKnobPosition(e);

			//* Default behavior to support elastic effect
			v = this.transformToVideo(v);
			if (this.constrainToBgProgress === true) {
				v = (this.increment) ? this.calcConstrainedIncrement(v) : v;
				var ev = this.bgProgress + (v-this.bgProgress)*0.4;
				v = this.clampValue(this.min, this.bgProgress, v);
				this.elasticFrom = (this.elasticEffect === false || this.bgProgress > v) ? v : ev;
				this.elasticTo = v;
			} else {
				v = (this.increment) ? this.calcIncrement(v) : v;
				v = this.clampValue(this.min, this.max, v);
				this.elasticFrom = this.elasticTo = v;
			}
			this.currentTime = v;
			this.updateKnobPosition(this.elasticFrom);

			if (this.lockBar) {
				this.setProgress(this.elasticFrom);
				this.sendChangingEvent({value: this.elasticFrom});
				this.sendSeekEvent(this.elasticFrom);
			}
			return true;
		}
	},

	/**
	* If `dragfinish`, bubbles
	* [onSeekFinish]{@link moon.VideoTransportSlider#onSeekFinish} event and overrides
	* parent `dragfinish` handler.
	*
	* @fires moon.VideoTransportSlider#onSeekFinish
	* @private
	*/
	dragfinish: function (sender, e) {
		if (this.disabled) {
			return;
		}
		var v = this.calcKnobPosition(e);
		v = this.transformToVideo(v);
		var z = this.elasticTo;
		if (this.constrainToBgProgress === true) {
			z = (this.increment) ? this.calcConstrainedIncrement(z) : z;
			this.animateTo(this.elasticFrom, z);
			v = z;
		} else {
			v = (this.increment) ? this.calcIncrement(v) : v;
			this._setValue(v);
		}
		e.preventTap();
		// this.hideKnobStatus();
		this.doSeekFinish({value: v});
		Spotlight.unfreeze();

		this.$.knob.removeClass('active');
		this.dragging = false;
		return true;
	},

	/**
	* Sends [onSeek]{@link moon.VideoTransportSlider#onSeek} event.
	*
	* @fires moon.VideoTransportSlider#onSeek
	* @private
	*/
	sendSeekEvent: function (val) {
		this.doSeek({value: val});
	},

	/**
	* During time update, updates buffered progress, canvas, video currentTime, and duration.
	*
	* @private
	*/
	timeUpdate: function (sender, e) {
		this._currentTime = sender._currentTime;
		if (!this.dragging && this.isInPreview()) { return; }
		this._duration = sender.duration;
		this.currentTime = this._currentTime;
		this.duration = this._duration;
		this.$.endTickText.setContent(this.formatTime(this.duration));
	},

	/**
	* Properly formats time.
	*
	* @private
	*/
	formatTime: function (val) {
		var hour = Math.floor(val / (60*60));
		var min = Math.floor((val / 60) % 60);
		var sec = Math.floor(val % 60);
		var time = {minute: min, second: sec};
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
		return (val) ? (String(val).length < 2) ? '0'+val : val : '00';
	},

	/**
	* Sends current status to [feedback]{@link moon.VideoFeedback} control in response to
	* user input.
	*
	* @param {String} - msg The string to display.
	* @param {moon.VideoTransportSlider~FeedbackParameterObject} params - A
	*	[hash]{@glossary Object} of parameters that accompany the message.
	* @param {Boolean} persist - If `true`, the [feedback]{@link moon.VideoFeedback} control will
	*	not be automatically hidden.
	* @param {String} leftSrc - The source url for the image displayed on the left side of
	*	the feedback control.
	* @param {String} rightSrc - The source url for the image displayed on the right side
	*	of the feedback control.
	* @public
	*/
	feedback: function (msg, params, persist, leftSrc, rightSrc) {
		this.showKnobStatus();
		this.$.feedback.feedback(msg, params, persist, leftSrc, rightSrc, this.isInPreview());
	},

	/**
	* @private
	*/
	updatePopupHeight: function () {
		var h = this.getPopupHeight();
		this.$.popupLabel.applyStyle('height', dom.unit(ri.scale(h), 'rem'));
	},

	/**
	* @private
	*/
	updatePopupOffset: function () {
		this.$.popup.applyStyle('top', dom.unit(-(ri.scale(this.getPopupHeight() + this.getPopupOffset())), 'rem'));
	}
});