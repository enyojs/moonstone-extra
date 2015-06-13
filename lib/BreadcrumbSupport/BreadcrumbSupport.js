require('moonstone');

/**
* Contains the declaration for the {@link moon.BreadcrumbSupport} kind.
* @module moon/BreadcrumbSupport
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
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
		onSpotlightFocus: 'focusHandler'
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
	decorateEvent: function (nom, event, sender) {
		event.breadcrumb = true;
		event.index = this.index;
	},
	focusHandler: function(sender, event) {
		var bounds = this.getAbsoluteBounds(),
			containerBounds = this.container.getAbsoluteBounds(),
			panelEdge = containerBounds.right;
		if (bounds.right <= 0 || bounds.left >= panelEdge) return true;
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
		* `alwaysviewing`, `activity` or `none`
		*
		* @type {String}
		* @default `always`
		* @public
		*/
		pattern: 'alwaysviewing'
	},

	breadcrumbTools: [
		{name: 'bgScrim', kind: Control, classes: 'moon-breadcrumb-bgscrim enyo-fit'},
		{name: 'breadcrumbs', kind: Control, classes: 'moon-breadcrumb-breadcrumbs', ontap: 'breadcrumbTap', onSpotlightRight: 'spotlightBreadcrumbRight'},
		{name: 'client', kind: Control, classes: 'enyo-light-panels-client', onSpotlightLeft: 'spotlightPanelLeft', onSpotlightRight: 'spotlightPanelRight'}
	],

	orientation: 'horizontal',
	
	transitioning: false,

	initComponents: kind.inherit(function (sup) {
		return function () {
			var length = this.components ? this.components.length - 1 : 0;
			if (this.components) this.setupFirstPanel(this.components[0]);
			this.addClass(this.pattern);
			this.removeClass('enyo-light-panels-client');
			this.createChrome(this.breadcrumbTools);
			this.createBreadcrumb(length);
			this.discoverControlParent();
			sup.apply(this, arguments);
		};
	}),

	setupFirstPanel: function(firstPanel) {
		if (firstPanel == undefined) return;
		firstPanel.classes = firstPanel.classes || '';
		firstPanel.classes = firstPanel.classes + ' fullpanel';
	},

	createBreadcrumb: function(length, forceRender) {
		var comps = [], i, breadcrumbs;
		for (i=0; i<length; i++) {
			comps.push({kind: Breadcrumb, panels: this});
		}
		this.$.breadcrumbs.createChrome(comps);

		breadcrumbs = this.getBreadcrumbs();
		for (i=0; i<breadcrumbs.length; i++) {
			breadcrumbs[i].set('index', i);
			if (forceRender || (!forceRender && !breadcrumbs[i].generated))
				breadcrumbs[i].render();
		}
	},

	setupTransitions: kind.inherit(function (sup) {
		return function (previousIndex, animate) {
			var panels = this.getPanels(), nextPanel = panels[this.index];
			if (nextPanel) {
				this.set('transitioning', true);
			}
			sup.apply(this, arguments);
			// Initial render by pushPanel
			if (isNaN(this._indexDirection) ||
				(this._indexDirection < 0 && this.index == 0)) {
				this.addClass('fullpanel');
			}
		};
	}),

	transitionFinished: kind.inherit(function (sup) {
		return function (sender, ev) {
			if (ev.originator === this._currentPanel && 
				(this.queuedIndex === undefined || this.queuedIndex == this.index)) {
				this.set('transitioning', false);
				if (this._indexDirection > 0 && this.index == 1) {
					this.removeClass('fullpanel');
				}
			}
			sup.apply(this, arguments);
		};
	}),

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

	applyTransitions: kind.inherit(function (sup) {
		return function (nextPanel, direct) {
			sup.apply(this, arguments);
			var bs = this.getBreadcrumbs();
			for(var i=0; i < bs.length; i++) {
				// apply the transition for the next panel
				var nextTransition = {};
				nextTransition['translate' + this._axis] = -100 * (this.index-i) * this._direction + '%';
				dom.transform(bs[i], nextTransition);
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

	/**
	* @private
	*/
	adjustDuration: function(diff) {
		if (this._duration === undefined) {
			this._duration = this.duration;
		}
		this.duration = this.duration / Math.abs(diff);
	},
	
	/**
	* @private
	*/
	restoreDuration: function() {
		// Restore duration
		if (this._duration !== undefined) {
			this.duration = this._duration;
		}
	},

	/*
	* We don't call sup but change visibility class instead. 
	*/
	showingChanged: kind.inherit(function (sup) {
		return function (nextPanel, direction) {
			this.addRemoveClass('visible', this.showing);
		};
	}),

	spotlightPanelLeft: kind.inherit(function (sup) {
		return function (sender, event) {
			if (!this.transitioning && event.spotSentFromContainer === true && 
				event.originator.parent == this.$.client && this.index > 0) {
				this.previous();
				return true;
			}
			sup.apply(this, arguments);
		};
	}),

	spotlightPanelRight: kind.inherit(function (sup) {
		return function (sender, event) {
			if (!this.transitioning && event.spotSentFromContainer === true && 
				event.originator.parent == this.$.client && 
				this.index < this.getClientControls().length - 1) {
				this.next();
				return true;
			}
			sup.apply(this, arguments);
		};
	}),

	spotlightBreadcrumbRight: kind.inherit(function (sup) {
		return function (sender, event) {
			if (!this.transitioning && event.breadcrumb && event.index+1 == this.index) {
				Spotlight.spot(this.getActivePanel());
				return true;
			}
		};
	}),

	pushPanel: kind.inherit(function (sup) {
		return function (info, moreInfo, opts) {
			if (this.transitioning) return true;
			if (this.getPanels().length == 0 && info) {
				this.setupFirstPanel(info[0]);
			}
			this.createBreadcrumb(1, true);
			sup.apply(this, arguments);
		};
	}),

	pushPanels: kind.inherit(function (sup) {
		return function (info, moreInfo, opts) {
			if (this.transitioning) return true;
			if (this.getPanels().length == 0 && info) {
				this.setupFirstPanel(info[0]);
			}
			this.createBreadcrumb(info.length, true);
			sup.apply(this, arguments);
		};
	}),
	
	popPanels: kind.inherit(function (sup) {
		return function (index, preserve) {
			Spotlight.unspot();
			sup.apply(this, arguments);
		};
	}),
	
	popPanel: kind.inherit(function (sup) {
		return function (index, preserve) {
			var breadcrumbs = this.getBreadcrumbs();

			for (var panelIndex = index; panelIndex >= this.index; panelIndex--) {
				breadcrumbs[index] && breadcrumbs[index].destroy();
			}
			sup.apply(this, arguments);
		};
	}),

	// Blocking focus move while transition
	transitioningChanged: function(oldValue) {
		// if (this.transitioning && Spotlight.getCurrent()) {
		// 	Spotlight.unspot();
		// }
		Spotlight[ (this.transitioning ? '' : 'un') + 'freeze']();
		// if (!this.transitioning && !Spotlight.isSpottable(Spotlight.getCurrent(), true)) {
		// 	Spotlight.spot(this.getActivePanel());
		// }
	},

	breadcrumbTap: function(sender, ev) {
		if (!this.transitioning && ev.breadcrumb) 
			this.set('index', ev.index);
	},

	getBreadcrumbs: function() {
		return this.$.breadcrumbs.children;
	}
};