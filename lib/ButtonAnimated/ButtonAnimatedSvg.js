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
			{name: 'animation', kind: SvgAnimate, fill: 'freeze', keyframeLibrary: {
				focus: [
					'M1,90c0.9-1.3,2.1-10.2-8-10c-9.8,0.2,7,10,7,10v10h2C2,100-1.2,93.2,1,90z',
					'M55,95c2.8-6.3-5.7-13.4-15-15C26.5,77.7,1,74.8,0,90v10h40C40,100,53,99.5,55,95z',
					'M97,90c3.5-10.4-18.2-16.7-27-20C41.3,59.3,3.7,51,0,70v30h87C87,100,94,98.8,97,90z',
					'M100,30C95.4,13.8,76.8,4.8,60,40C48.1,65,20,33,0,50v50.2h100C100,100.2,104.4,45.3,100,30z',
					'M80,20c-34.7,13.8-45.5,15.4-50,0C23.2-3.5,3,7.7,0,30v70.2h100C100,100.2,129,0.4,80,20z',
					'M100,0c-0.8-1.2-40-0.3-50,0C40.1,0.3,0,0,0,0v100h100C100,100,100.8,1.2,100,0z'
				],
				blur: [
					'M100,0c0,0-40-0.3-50,0C40.1,0.3,0,0,0,0v100h100V0z',
					'M100,0C80.5,13.6,71.1,21.2,50,20C33.5,19.1,22.9,14.9,0,0v100h100V0z',
					'M100,10C74.2,71.1,68.9,35.2,50,40C26.3,46,26,77,0,10v90h100V10z',
					'M100,70C86.3,87.1,68.6,93.5,50,90C26.9,85.6,7.8,92,0,70v30h100V70z',
					'M100,99c0,0-39.9-0.2-50,0c-9.8,0.2-50,0-50,0v1h100V99z'
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
	}
});
