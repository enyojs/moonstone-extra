require('moonstone');

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control');

var
	Spotlight = require('spotlight');

var exports = module.exports = {};


var Breadcrumb = kind({
	name: 'moon.Breadcrumb',
	kind: Control,
	spotlight: true,
	classes: 'moon-panels-breadcrumb',
	published: {
		index: 0
	},
	handlers: {
		ontap: 'tapHandler',
		onSpotlightFocus: 'focusHandler',
		onSpotlightRight: 'rightHandler'
	},	
	components: [
		{name: 'number', classes: 'moon-panels-breadcrumb-header'}
	],
	bindings: [
		{from: 'index', to: '$.number.content', transform: 'formatNumber'}
	],
	formatNumber: function (n) {
		var i=n+1;
		return '< ' + ((i < 10) ? '0' : '') + i;
	},
	tapHandler: function (sender, event) {
		event.breadcrumbTap = true;
		event.index = this.index;
	},
	focusHandler: function(sender, event) {
		var bounds = this.getAbsoluteBounds(),
			containerBounds = this.container.getAbsoluteBounds(),
			panelEdge = containerBounds.right;
		if (bounds.right <= 0 || bounds.left >= panelEdge) return true;
	},
	rightHandler: function(sender, event) {
		var panels = this.owner;
		if (this.index+1 ==	panels.index) {
			enyo.Spotlight.spot(panels.getActive());
			return true;
		}
	}
});

/**
* moon.BreadcrumbSupport is a mixin that is extend panels feature to support 
* moonstone style breadcrumb animation.
*
* todo:
* - Add breadcrumbs into breadcrumb container
* - Add show hide support and handle support
*
* @mixin moon.BreadcrumbSupport
* @protected
*/
exports.Support = {

	/**
	* @private
	*/
	name: 'moon.BreadcrumbSupport',

	/**
	* @private
	*/
	classes: 'moon-breadcrumb-support visible',

	
	/**
	* @private
	* @lends moon.BreadcrumbSupport.prototype
	*/
	published: {

		/**
		* The timing function to be applied to the transition animation between panels.
		*
		* @type {String}
		* @default 'ease-out'
		* @public
		*/
		timingOptions: {
			panel: {
				forward: {delay: 0, duration: 500, timingFunction: 'cubic-bezier(0.670, 0.005, 0.995, 0.365)'},
				backward: {delay: 0, duration: 500, timingFunction: 'cubic-bezier(0.080, 0.700, 0.470, 0.960)'}
			},
			breadcrumb: {
				forward: {delay: 500, duration: 70, timingFunction: 'cubic-bezier(0.080, 0.700, 0.470, 0.960)'},
				backward: {delay: 250, duration: 250, timingFunction: 'cubic-bezier(0.080, 0.700, 0.470, 0.960)'}
			}
		},

		/**
		* `always`, `activity` or `none`
		*
		* @type {String}
		* @default `always`
		* @public
		*/
		pattern: 'always'
	},

	handlers: {
		onTapBreadcrumb: 'breadcrumbTap',
		onSpotlightLeft: 'spotlightPanelLeft',
		onSpotlightRight: 'spotlightPanelRight'
	},

	breadcrumbTools: [
		{name: 'bgScrim', kind: Control, classes: 'moon-breadcrumb-bgscrim enyo-fit'},
		{name: 'breadcrumbs', kind: Control, classes: 'moon-breadcrumb-breadcrumbs'},
		{name: 'client', kind: Control, classes: 'enyo-light-panels-client'}
	],

	transitioning: false,

	initComponents: kind.inherit(function (sup) {
		return function () {
			this.addClass(this.pattern);
			this.removeClass('enyo-light-panels-client');
			this.createChrome(this.breadcrumbTools);
			this.discoverControlParent();
			sup.apply(this, arguments);
		};
	}),

	createBreadcrumb: function(n) {
		var comps = [];
		for (i=0; i<n; i++) {
			comps.push({kind: Breadcrumb, index: i});
		}
		this.$.breadcrumbs.createChrome(comps);
	},

	initTransition: kind.inherit(function (sup) {
		return function (nextPanel, direction) {
			sup.apply(this, arguments);
			var bs = this.getBreadcrumbs();
				timing = this.fetchBreadcrumbTimingOption(direction);
			for(var i=0; i < bs.length; i++) {
				this.applyTimingOption(bs[i], timing);
			}
		};
	}),

	fetchTimingOption: function(direction) {
		var timing = {},
			o = this.timingOptions['panel'][direction];
		timing.duration = o.duration / this.indexDistance;
		timing.timingFunction = o.timingFunction;
		timing.delay = o.delay;
		return timing;
	},

	fetchBreadcrumbTimingOption: function(direction) {
		var timing = {},
			o = this.timingOptions['breadcrumb'][direction];
		timing.duration = o.duration;
		timing.timingFunction = o.timingFunction;
		timing.delay = o.delay;
		return timing;
	},

	showingChanged: kind.inherit(function (sup) {
		return function (nextPanel, direction) {
			this.addRemoveClass('visible', this.showing);
			// sup.apply(this, arguments);
		};
	}),

	setupTransitions: kind.inherit(function (sup) {
		return function () {
			this.addRemoveClass('first', this.index == 0);
			this.set('transitioning', true);
			sup.apply(this, arguments);
		};
	}),

	spotlightPanelLeft: kind.inherit(function (sup) {
		return function (sender, event) {
			if (!this.transitioning && event.spotSentFromContainer === true && event.originator.parent == this.$.client) {
				this.previous();
			}
			sup.apply(this, arguments);
		};
	}),

	spotlightPanelRight: kind.inherit(function (sup) {
		return function (sender, event) {
			if (!this.transitioning && event.spotSentFromContainer === true && event.originator.parent == this.$.client) {
				this.next();
			}
			sup.apply(this, arguments);
		};
	}),

	transitionFinished: kind.inherit(function (sup) {
		return function (sender, ev) {
			if (ev.originator === this._currentPanel && !this.queuedIndex) {
				this.set('transitioning', false);
			}
			sup.apply(this, arguments);
		};
	}),

	pushPanel: kind.inherit(function (sup) {
		return function () {
			if (this.transitioning) return true;
			sup.apply(this, arguments);
		};
	}),

	pushPanels: kind.inherit(function (sup) {
		return function () {
			if (this.transitioning) return true;
			sup.apply(this, arguments);
		};
	}),

	// Blocking focus move while transition
	transitioningChanged: function(oldValue) {
		if (this.transitioning && Spotlight.getCurrent()) {
			Spotlight.unspot();
		}
		Spotlight[ (this.transitioning ? '' : 'un') + 'freeze']();
		if (!this.transitioning && !Spotlight.isSpottable(Spotlight.getCurrent(), true)) {
			Spotlight.spot(this.getActivePanel());
		}
	},

	breadcrumbTap: function(sender, ev) {
		this.set('index', ev.index);
	},

	getBreadcrumbs: function() {
		return this.$.breadcrumbs.children;
	}		
};