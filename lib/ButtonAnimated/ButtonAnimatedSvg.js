require('moonstone');

var
	kind = require('enyo/kind'),
	EventEmitter = require('enyo/EventEmitter');

var
	SvgRoot = require('svg/Root'),
	SvgPath = require('svg/Path'),
	SvgAnimate = require('svg/Animate');

module.exports = kind({
	name: 'moon.ButtonAnimatedSvg',
	kind: SvgRoot,
	mixins: [EventEmitter],
	viewBox: '0 0 100 100',
	classes: 'moon-button-animated-root',
	_focused: false,
	components: [
		// Path to be animated
		{name: 'path', kind: SvgPath, classes: 'moon-button-animated-path', components: [
			// Animation
			// {name: 'animation', kind: 'moon.ButtonAnimatedAnim'}
			{name: 'animation', kind: SvgAnimate, fill: 'freeze', keyframeLibrary: {
				focus: [
					'M100,99c0,0-40.2,0-50,0S0,99,0,99v1h100V99z',
					'M100,50c-10.6,11.9-36.5,16.5-50,0S14.4,35.1,0,50v50h100V50z',
					'M100,0c0,0-40,0-50,0S0,0,0,0v100h100V0z'
				],
				blur: [
					'M100,0c0,0-40,0-50,0S0,0,0,0v100h100V0z',
					'M100,50c-10.6,11.9-36.5,16.5-50,0S14.4,35.1,0,50v50h100V50z',
					'M100,99c0,0-40.2,0-50,0S0,99,0,99v1h100V99z'
				]
			}}
		]}
	],
	// handlers: {
	// 	end: 'animDone',
	// 	onEnd: 'animDone',
	// 	onEndEvent: 'animDone',
	// 	endEvent: 'animDone'
	// },
	events: {
		onEnd: ''
	},
	bindings: [
		{from: 'pathStyle', to: '$.path.style'},
		{from: 'duration', to: '$.animation.dur'}
	],
	create: function () {
		this.inherited(arguments);
		// this.$.animation.on('end', this.doEnd, this);
		this.$.animation.on('end', function() { this.doEnd({focused: this._focused}); }, this);
	},
	startFocus: function () {
		this.$.animation.checkout('focus');
		this._focused = true;
		this.$.animation.start();
	},
	startBlur: function () {
		this.$.animation.checkout('blur');
		this._focused = false;
		this.$.animation.start();
	// },
	// animDone: function (sender, ev) {
	// 	console.log("animation done", ev);
	}
});
