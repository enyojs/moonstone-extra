/**
* Contains the declaration for {@link module:moonstone-extra/Panels~Panels} and supporting kinds.
* @module moonstone-extra/Panels
*/

require('moonstone-extra');

var
	kind = require('enyo/kind'),
	dispatcher = require('enyo/dispatcher'),
	dom = require('enyo/dom'),
	util = require('enyo/utils'),
	Control = require('enyo/Control'),
	Signals = require('enyo/Signals'),
	ri = require('enyo/resolution');

var
	Panels = require('layout/Panels');

var
	Spotlight = require('spotlight');

var
	options = require('moonstone/options'),
	StyleAnimator = require('moonstone/StyleAnimator'),
	MoonHistory = require('moonstone/History'),
	HistorySupport = MoonHistory.HistorySupport;

var
	Panel = require('moonstone-extra/Panel'),
	MoonArranger = require('moonstone-extra/MoonArranger'),
	MoonAnimator = require('moonstone-extra/MoonAnimator');

/**
* `PanelsHandle` is a helper kind for {@link module:moonstone-extra/Panels~Panels} which implements a spottable
*  handle that the user can interact with to hide and show the `Panels` control.
*
* @class PanelsHandle
* @extends module:enyo/Control~Control
* @ui
* @public
*/
var PanelsHandle = kind(
	/** @lends module:moonstone-extra/Panels~PanelsHandle.prototype */ {

	/**
	* @private
	*/
	name: 'moon.PanelsHandle',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-panels-handle',

	/**
	* We override getAbsoluteShowing so that the handle's spottability is not dependent on the
	* showing state of its parent, the {@link module:moonstone-extra/Panels~Panels} control.
	*
	* @private
	*/
	getAbsoluteShowing: function (ignoreBounds) {
		var bounds = !ignoreBounds ? this.getBounds() : null;

		if (!this.generated || this.destroyed || !this.showing || (bounds &&
			bounds.height === 0 && bounds.width === 0)) {
			return false;
		}

		return true;
	}

});

/**
* `Breadcrumb` is a helper kind for {@link module:moonstone-extra/Panels~Panels} which implements a breadcumb
* which is display panel index on it.
*
* @class Breadcrumb
* @extends module:enyo/Control~Control
* @ui
* @public
*/
var Breadcrumb = kind(
	/** @lends module:moonstone-extra/Panels~Breadcrumb.prototype */ {

	/**
	* @private
	*/
	name: 'moon.Breadcrumb',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	* @lends module:moonstone-extra/Panels~Breadcrumb.prototype
	*/
	published: {
		/*
		* @private
		*/
		index: 0
	},

	/**
	* @private
	*/
	spotlight: true,

	/**
	* @private
	*/
	handlers: {
		ontap: 'tapHandler',
		onSpotlightFocus: 'focusHandler',
		onSpotlightRight: 'rightHandler'
	},

	/**
	* @private
	*/
	classes: 'moon-panels-breadcrumb',

	/**
	* @private
	*/
	components: [
		{name: 'number', kind: Control, classes: 'moon-panels-breadcrumb-header'}
	],

	/**
	* @private
	*/
	bindings: [
		{from: 'index', to: '$.number.content', transform: 'formatNumber'}
	],

	/**
	* @private
	*/
	formatNumber: function (n) {
		var i=n+1;
		return '< ' + ((i < 10) ? '0' : '') + i;
	},

	/**
	* @private
	*/
	tapHandler: function (sender, event) {
		// decorate
		event.breadcrumbTap = true;
		event.index = this.index;
	},

	/**
	* Block focus on offscreen breadcrumb.
	* @private
	*/
	focusHandler: function(sender, event) {
		var bounds = this.getAbsoluteBounds(),
			containerBounds = this.container.getAbsoluteBounds(),
			right = bounds ? bounds.right : null,
			left = bounds ? bounds.left : null,
			panelEdge = containerBounds ? containerBounds.right : null;
		if (right <= 0 || left >= panelEdge) return true;
	},

	/** 
	* @private
	*/	
	rightHandler: function(sender, event) {
		var panels = this.owner;
		if (this.index+1 ==	panels.index) {
			Spotlight.spot(panels.getActive());
			return true;
		}
	}
});


/**
* {@link module:moonstone-extra/Panels~Panels} extends {@link module:layout/Panels~Panels}, adding support for 5-way focus
* (Spotlight) and pre-configured Moonstone panels design patterns. By default,
* controls added to a `Panels` are instances of {@link module:moonstone-extra/Panel~Panel}.
*
* `Panels` introduces the concept of patterns for panel display. Set
* [pattern]{@link module:moonstone-extra/Panels~Panels#pattern} to `'activity'` or `'alwaysViewing'`
* to use one of two patterns designed for apps on Smart TV systems.
*
* @class Panels
* @extends module:enyo/Panels~Panels
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone-extra/Panels~Panels.prototype */ {

	/**
	* @private
	*/
	name: 'moon.Panels',

	/**
	* @private
	*/
	kind : Panels,

	/**
	* @private
	*/
	mixins : [HistorySupport],

	/**
	* @private
	*/
	classes : 'moon-panels enyo-fit',

	/**
	* @private
	*/
	spotlightDecorate : false,

	/**
	* @private
	* @lends module:moonstone-extra/Panels~Panels.prototype
	*/
	published: {
		/**
		* A convenience property for configuring {@link module:moonstone-extra/Panels~Panels} according to a
		* particular design pattern.  Valid values are `'none'` (default), `'activity'`,
		* and `'alwaysviewing'`. Note that this property may only be set at creation
		* time, and should not be changed at runtime.
		*
		* The `'alwaysviewing'` pattern uses the {@link module:moonstone/BreadcrumbArranger~BreadcrumbArranger} with
		* semi-transparent panels (depending on the color theme) over the right half
		* of the screen, allowing multiple breadcrumbs to accumulate on the left
		* half of the screen.
		*
		* The `'activity'` pattern  uses the `BreadcrumbArranger` with opaque
		* panels over the full screen and only one breadcrumb showing onscreen.
		*
		* The `'none'` pattern should be used when selecting other arrangers, such as
		* {@link module:layout/CarouselArranger~CarouselArranger} or {@link module:layout/CardArranger~CardArranger}.
		*
		* @type {String}
		* @default 'none'
		* @public
		*/
		pattern: 'none',

		/**
		* When [useHandle]{@link module:moonstone-extra/Panels~Panels#useHandle} is used, it is automatically
		* hidden after this amount of time (in milliseconds).
		*
		* @type {Number}
		* @default 4000
		* @public
		*/
		autoHideTimeout: 4000,

		/**
		* When `true`, a handle is created to allow the user to control the showing
		* state of the panels using animation. When `false`, no handle is created and
		* panels may only be hidden/shown programmatically with no animation.
		* When `'auto'` (the default), `useHandle` is set to `true` if the
		* [pattern]{@link module:moonstone-extra/Panels~Panels#pattern} is `'alwaysviewing'` and to `false` if
		* the `pattern` is `'activity'`. Note that this property may only be set at
		* creation time, and should not be changed at runtime. This property
		* only has an effect when using the `'activity'` or `'alwaysviewing'` pattern.
		*
		* @type {String|Boolean}
		* @default 'auto'
		* @public
		*/
		useHandle: 'auto',

		/**
		* Dynamically controls whether the handle is showing.
		* When `true` (the default), the handle is shown and panels may be shown by
		* activating the handle and hidden by re-activating the handle or by tapping
		* outside the panel area. When `false`, the handle is hidden and panels may
		* only be shown or hidden programmatically using the
		* [showing]{@link module:enyo/Control~Control#showing} property or the
		* [show()]{@link module:enyo/Control~Control#show}/[hide()]{@link module:enyo/Control~Control#hide} API.
		* This property only has an effect when [useHandle]{@link module:moonstone-extra/Panels~Panels#useHandle}
		* is `true` (or `'auto'`, resulting in `true`).
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		handleShowing: true,

		/**
		* When `true`, panels are automatically popped when the user moves back.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		popOnBack: false,

		/**
		* When `true`, focus can move from panel to breadcrumb when press left key. (Experimental)
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		leftKeyToBreadcrumb: false
	},

		/**
	* @private
	*/
	toIndex: null,

	/**
	* @private
	*/
	narrowFit: false,

	/**
	* Hierachical stack.
	* When we call setIndex or pushPanel, new object is pushed to this stack.
	* When we call popPanel or back key handler, lasted object is removed.
	* To save memory, it is initiated when this.allowBackKey is true.
	*
	* @type {Array}
	* @default null
	* @private
	*/
	panelStack: null,

	/**
	* @private
	*/
	fractions: {panel: 1, breadcrumb: 1},

	/**
	* @private
	*/
	handlers: {
		ontap:						'tapped',
		onSpotlightRight:			'spotlightRight',
		onSpotlightLeft:			'spotlightLeft',
		onSpotlightFocus:			'spotlightFocus',
		onSpotlightContainerLeave:	'onSpotlightPanelLeave',
		onSpotlightContainerEnter:	'onSpotlightPanelEnter'
	},

	/**
	* @private
	*/
	handleTools: [
		{name: 'backgroundScrim', kind: Control, classes: 'moon-panels-background-scrim'},
		{name: 'clientWrapper', kind: Control, classes: 'enyo-fill moon-panels-client-wrapper', components: [
			{name: 'scrim', kind: Control, classes: 'moon-panels-panel-scrim'},
			{name: 'breadcrumbs', kind: Control, classes: 'moon-panels-breadcrumbs'},
			{name: 'panelsViewport', kind: Control, classes: 'moon-panels-viewport', components: [
				{name: 'client', kind: Control, tag: null}
			]}
		]},
		{name: 'showHideHandle', kind: PanelsHandle, classes: 'hidden', canGenerate: false, ontap: 'handleTap', onSpotlightLeft: 'handleSpotLeft', onSpotlightRight: 'handleSpotRight', onSpotlightFocused: 'handleFocused', onSpotlightBlur: 'handleBlur'},
		{name: 'showHideAnimator', kind: StyleAnimator, onComplete: 'showHideAnimationComplete'}
	],

	/**
	* @private
	*/
	animatorTools: [
		{name: 'animator', kind: MoonAnimator, onStep: 'step', useBezier: true, onEnd: 'animationEnded', configs: { 
			panel: {
				forward: { startValue: 0, endValue: 1, delay: 0, duration: 230, bezier: [.69,.01,.97,.59]},
				backward: { startValue: 0, endValue: 1, delay: 0, duration: 300, bezier: [.06,.53,.38,.99] }
			},
			breadcrumb: {
				forward: { startValue: 0, endValue: 1, delay: 230, duration: 70, bezier: [.46,.28,.76,.57] },
				backward: { startValue: 0, endValue: 1, delay: 150, duration: 150, bezier: [.08,.51,.24,.99] }
			}
		}}
	],

	/**
	* @private
	*/
	defaultKind: Panel,

	/**
	* When `false`, dragging is disabled.
	*
	* @private
	*/
	draggable: false,

	/**
	* Default to using `BreadcrumbArranger`.
	*
	* @private
	*/
	arrangerKind: MoonArranger,

	/**
	* Index of panel set in the middle of transition.
	*
	* @private
	*/
	queuedIndex: null,

	/**
	* Flag for blocking consecutive push/pop/replace panel actions to protect
	* create/render/destroy time.
	*
	* @private
	*/
	isModifyingPanels: false,

	/**
	* Flag to indicate if the Panels are currently transitioning to a new index.
	*
	* @private
	*/
	transitioning: false,

	/**
	* Width of breadcrumb.
	*
	* @private
	*/
	breadcrumbWidth: ri.scale(96),

	/**
	* Checks the state of panel transitions.
	*
	* @return {Boolean} `true` if a transition between panels is currently in progress;
	* otherwise, `false`.
	* @public
	*/
	inTransition: function () {
		return this.transitioning;
	},

	/**
	* Returns list of breadcrumb objects
	*
	* @return {Array} List of breadcrumbs.
	* @public
	*/
	getBreadcrumbs: function () {
		return this.$.breadcrumbs ? this.$.breadcrumbs.children : [];
	},

	/**
	* Returns reference to breadcrumb at the specified index.
	*
	* @public
	*/
	getBreadcrumbForIndex: function (index) {
		var breadcrumbs = this.getBreadcrumbs();
		return breadcrumbs[(index + breadcrumbs.length) % breadcrumbs.length];
	},

	/**
	* Returns maximum number of breadcrumbs that can be fit in the breadcrumb area.
	*
	* @return {Number} Number of breadcrumbs.
	* @public
	*/
	getBreadcrumbMax: function () {
		if (this.pattern == 'activity') return 1;
		// Always viewing pattern is using half screen to show breadcrumbs
		return Math.round(window.innerWidth / 2 / this.breadcrumbWidth);
	},

	/**
	* Returns range of breadcrumb index.
	*
	* @return {Object} Object contains start and end value as a hash. '{start: start, end: end}'
	* @public
	*/
	getBreadcrumbRange: function () {
		/** To support fly weight pattern, we use a concept of a window.
		    If we are seeing maximum 1 breadcrumb on screen (case of activity pattern),
		    we arrange 2 breadcrumbs at a time (current and previous) to show animation.
		    If we move forward from index 2 to 3 (active is 3), the window can be [2, 3].
		*/
		var end = this.index,
			start = end - this.getBreadcrumbs().length;

		// If we move backward from index 4 to 3 (active is 3), the window can be [3, 4].
		if (this.fromIndex > this.toIndex) {
			start = start+1;
			end = end+1;
		}
		return {start: start, end: end};
	},

	/**
	* We just recalculate transition position on pushPanel, because reflow is high cost operation.
	* @private
	*/
	recalcLayout: function () {
		if (this.layout && this.layout.calcTransitionPositions) {
			this.arrangements = [];
			this.layout.calcTransitionPositions();
		} else {
			this.reflow();
		}
	},

	/**
	* Creates a panel on top of the stack and increments index to select that component.
	*
	* @param {Object} info - The declarative {@glossary kind} definition.
	* @param {Object} moreInfo - Additional properties to be applied (defaults).
	* @return {Object} The instance of the panel that was created on top of the stack.
	* @public
	*/
	pushPanel: function (info, moreInfo) { // added
		if (this.transitioning || this.isModifyingPanels) {return null;}
		this.isModifyingPanels = true;
		var lastIndex = this.getPanels().length - 1,
			oPanel = this.createComponent(info, moreInfo);
		oPanel.render();
		this.addBreadcrumb(true);
		this.recalcLayout();
		oPanel.resize();
		this.setIndex(lastIndex+1);
		this.isModifyingPanels = false;
		return oPanel;
	},

	/**
	* Options for the [Panels.pushPanels()]{@link module:moonstone-extra/Panels~Panels.pushPanels} method.
	*
	* @typedef {Object} module:moonstone-extra/Panels~Panels.pushPanels~options
	* @property {Number} targetIndex - The panel index number to immediately switch to. Leaving
	*	this blank or not setting it will perform the default action, which transitions to the
	*	first of the new panels. Setting this to a negative and other 'out of bounds' values
	*	work in conjunction with the `wrap: true` property. Negative values count backward from
	*	the end, while indices greater than the total Panels' panel length wrap around and start
	*	counting again from the beginning.
	* @property {Boolean} transition - Whether to transition or jump directly to the next panel.
	* @public
	*/

	/**
	* Creates multiple panels on top of the stack and updates index to select the last one
	* created. Supports an optional `options` object as the third parameter.
	*
	* @param {Object[]} info - The declarative {@glossary kind} definitions.
	* @param {Object} commonInfo - Additional properties to be applied (defaults).
	* @param {Object} options - Additional options for pushPanels.
	* @return {null|Object[]} Array of the panels that were created on top of the stack, or
	*	`null` if panels could not be created.
	* @public
	*/
	pushPanels: function (info, commonInfo, options) { // added
		if (this.transitioning || this.isModifyingPanels) { return null; }
		this.isModifyingPanels = true;

		if (!options) { options = {}; }
		var lastIndex = this.getPanels().length,
			oPanels = this.createComponents(info, commonInfo),
			nPanel;

		for (nPanel = 0; nPanel < oPanels.length; ++nPanel) {
			oPanels[nPanel].render();
		}
		this.addBreadcrumb(true);
		this.recalcLayout();	
		if (options.targetIndex || options.targetIndex === 0) {
			lastIndex = options.targetIndex;
		}
		lastIndex = this.clamp(lastIndex);
		for (nPanel = 0; nPanel < oPanels.length; ++nPanel) {
			oPanels[nPanel].resize();
		}
		// If transition was explicitly set to false, since null or undefined indicate 'never set' or unset
		if (options.transition === false) {
			this.setIndexDirect(lastIndex);
		} else {
			this.setIndex(lastIndex);
		}

		this.isModifyingPanels = false;
		return oPanels;
	},

	/**
	* Destroys panels whose index is greater than or equal to a specified value.
	*
	* @param {Number} index - Index at which to start destroying panels.
	* @public
	*/
	popPanels: function (index) {
		if (this.transitioning || this.isModifyingPanels) {return;}
		this.isModifyingPanels = true;
		var panels = this.getPanels(), breadcrumb,
			index = index || panels.length - 1;

		while (panels.length > index && index >= 0) {
			panels[panels.length - 1].destroy();
		}
		this.removeBreadcrumb();
		this.recalcLayout();
		this.isModifyingPanels = false;
	},

	/**
	* Destroys specified panel and creates new panel in-place without transition effect.
	*
	* @param {Number} index - Index of panel to destroy.
	* @param {Object} info - The declarative {@glossary kind} definition.
	* @param {Object} moreInfo - Additional properties to be applied (defaults).
	* @public
	*/
	replacePanel: function (index, info, moreInfo) {
		if (this.transitioning || this.isModifyingPanels) {return;}
		this.isModifyingPanels = true;
		var oPanel = null;

		if (this.getPanels().length > index) {
			this.getPanels()[index].destroy();
			if (this.getPanels().length > index) {
				moreInfo = util.mixin({addBefore: this.getPanels()[index]}, moreInfo);
			}
		}
		oPanel = this.createComponent(info, moreInfo);
		oPanel.render();
		this.resize();
		this.isModifyingPanels = false;
	},

	/**
	* Finds and returns the panel index of the passed-in control. Returns `-1` if
	* panel is not found.
	*
	* @param {Object} oControl - A control to look for.
	* @return {Number} Panel index of control, or `-1` if panel is not found.
	* @public
	*/
	getPanelIndex: function (oControl) {
		var oPanel = null;

		while (oControl && oControl.parent) {
			// Parent of a panel can be a client or a panels.
			if (oControl.parent === this.$.client || oControl.parent === this) {
				oPanel = oControl;
				break;
			}
			oControl = oControl.parent;
		}

		if (oPanel) {
			for (var n=0; n<this.getPanels().length; n++) {
				if (this.getPanels()[n] == oPanel) {
					return n;
				}
			}
		}

		return -1;
	},

	/**
	* Returns `true` if the passed-in control is a child panel of this Panels instance.
	*
	* @param {Object} control - A panel control.
	* @return {Boolean} `true` if the specified control is a child panel of this Panels
	* instance.
	* @public
	*/
	isPanel: function (control) {
		for (var n=0; n<this.getPanels().length; n++) {
			if (this.getPanels()[n] == control) {
				return true;
			}
		}
	},

	/**
	* @private
	*/
	refresh: function () {
		if (this.isMoonAnimatorUsed) {
			for(var k in this.$.animator.configs) {
				this.fractions[k] = 1;
			}
		}
		Panels.prototype.refresh.apply(this, arguments);
	},

	/**
	* @private
	*/
	step: function (sender) {
		if (this.isMoonAnimatorUsed) {
			for(var k in this.$.animator.configs) {
				this.fractions[k] = sender.values[k];
			}
		}
		Panels.prototype.step.apply(this, arguments);
		return true;
	},

	/**
	* @private
	*/
	stepTransition: function () {
		if (!this.hasNode()) return;

		if (this.isMoonAnimatorUsed) {
			this.arrangement = this.arrangement ? this.arrangement : {};
			for(var k in this.$.animator.configs) {
				this.arrangement[k] = this.interpolatesArrangement(this.fractions[k]);
			}
			if (this.layout && this.arrangement['panel'] && this.arrangement['breadcrumb'] ) {
				this.layout.flowArrangement();
			}
		} else {
			Panels.prototype.stepTransition.apply(this, arguments);
		}
	},

	/**
	* Interpolates between arrangements as needed.
	*
	* @param {Number} [fraction] - A value between 0 to 1.
	* @private
	*/
	interpolatesArrangement: function (fraction) {
		// select correct transition points and normalize fraction.
		var t$ = this.transitionPoints;
		var r = (fraction || 0) * (t$.length-1);
		var i = Math.floor(r);
		r = r - i;
		var s = t$[i], f = t$[i+1];
		// get arrangements and lerp between them
		var s0 = this.fetchArrangement(s);
		var s1 = this.fetchArrangement(f);
		return s0 && s1 ? Panels.lerp(s0, s1, r) : (s0 || s1);
	},

	/**
	* @method
	* @private
	*/
	create: function () {
		Panels.prototype.create.apply(this, arguments);
		this.set('animate', this.animate && options.accelerate, true);

		// we need to ensure our handler has the opportunity to modify the flow during
		// initialization
		this.showingChanged();
	},

	/**
	* @private
	*/
	initComponents: function () {
		this.applyPattern();
		Panels.prototype.initComponents.apply(this, arguments);
		this.isMoonAnimatorUsed = (this.$.animator instanceof MoonAnimator);
		this.addBreadcrumb();
		this.initializeShowHideHandle();
		this.handleShowingChanged();
		this.allowBackKeyChanged();
	},

	/**
	* @private
	*/
	rendered: function () {
		Panels.prototype.rendered.apply(this, arguments);

		// Direct hide if not showing and using handle
		if (this.useHandle === true) {
			if (this.showing) {
				this._directShow();
			} else {
				this._directHide();
			}
		}
	},

	/**
	* @private
	*/
	tapped: function (oSender, oEvent) {
		if (oEvent.originator === this.$.showHideHandle || this.pattern === 'none' ||
			this.transitioning === true || this.isModifyingPanels === true) {
			return;
		}

		if (this.shouldHide(oEvent)) {
			if (this.showing && (this.useHandle === true) && this.handleShowing) {
				this.hide();
			}
		} else {
			var n = (oEvent.breadcrumbTap) ? oEvent.index : -1;
			// If tapped on not current panel (breadcrumb), go to that panel
			if (n >= 0 && n !== this.getIndex()) {
				this.setIndex(n);
			}
		}
	},

	/**
	* @private
	*/
	shouldHide: function (oEvent) {
		return (oEvent.originator === this.$.clientWrapper || (oEvent.originator instanceof Panel && this.isPanel(oEvent.originator)));
	},

	/**
	* @private
	*/
	spotlightLeft: function (oSender, oEvent) {
		if (this.toIndex !== null) {
			this.queuedIndex = this.toIndex - 1;
			//queuedIndex could have out boundary value. It will be managed in setIndex()
		}
		var orig = oEvent.originator,
			idx = this.getPanelIndex(orig);

		if (orig instanceof Panel) {
			if (idx === 0) {
				if (this.showing && (this.useHandle === true) && this.handleShowing) {
					this.hide();
					return true;
				}
			}
			else {
				if (!this.leftKeyToBreadcrumb) {
					this.previous();
					return true;
				}
			}
		}
	},

	/**
	* @private
	*/
	spotlightRight: function (oSender, oEvent) {
		if (this.toIndex !== null) {
			this.queuedIndex = this.toIndex + 1;
			//queuedIndex could have out boundary value. It will be managed in setIndex()
		}
		var orig = oEvent.originator,
			idx = this.getPanelIndex(orig),
			next = this.getPanels()[idx + 1];

		if (next && orig instanceof Panel) {
			if (this.useHandle === true && this.handleShowing && idx == this.index) {
				Spotlight.spot(this.$.showHideHandle);
			}
			else {
				this.next();
			}
			return true;
		}
	},

	/**
	* @private
	*/
	spotlightFocus: function (oSender, oEvent) {
		var orig = oEvent.originator;
		var idx = this.getPanelIndex(orig);
		if (this.index !== idx && idx !== -1) {
			this.setIndex(idx);
		}
	},

	/**
	* Responds to tap on show/hide handle.
	*
	* @private
	*/
	handleTap: function () {
		this.setShowing(!this.showing);
	},

	/**
	* @private
	*/
	handleSpotLeft: function () {
		if (this.showing) {
			Spotlight.spot(this.getActive());
		} else {
			Spotlight.unspot();
		}
		return true;
	},

	/**
	* @private
	*/
	handleSpotRight: function (sender, event) {
		if (this.showing) {
			return true;
		}
	},

	/**
	* @private
	*/
	handleBlur: function (sender, event) {
		if (this.isHandleFocused) {
			this.isHandleFocused = false;
			if (!Spotlight.getPointerMode()) {
				if (!this.showing) {
					this.panelsHiddenAsync();
				}
			}
		}
		this.resetHandleAutoHide();
		if (!this.showing) {
			Signals.send('onPanelsHandleBlurred');
		}
	},

	/**
	* @private
	*/
	panelsHiddenAsync: function () {
		util.asyncMethod(Signals, 'send', 'onPanelsHidden');
	},

	/**
	* @private
	*/
	resetHandleAutoHide: function (sender, event) {
		this.startJob('autoHide', 'stashHandle', this.getAutoHideTimeout());
	},

	/**
	* @private
	*/
	stopHandleAutoHide: function (sender, event) {
		this.stopJob('autoHide');
	},

	/**
	* @private
	*/
	stashHandle: function () {
		this.$.showHideHandle.addRemoveClass('stashed', !this.showing);
	},

	/**
	* @private
	*/
	unstashHandle: function () {
		this.stopHandleAutoHide();
		this.$.showHideHandle.removeClass('stashed');
	},

	/**
	* @private
	*/
	handleFocused: function () {
		this.unstashHandle();
		this.startJob('autoHide', 'handleSpotLeft', this.getAutoHideTimeout());
		this.isHandleFocused = true;
		Signals.send('onPanelsHandleFocused');
	},

	/**
	* @private
	*/
	handleShowingChanged: function () {
		//* show handle only when useHandle is true
		if (this.useHandle !== true) { return; }
		this.$.showHideHandle.addRemoveClass('hidden', !this.handleShowing);
		this.$.showHideHandle.spotlight = this.handleShowing;
	},

	/**
	* Called when focus enters one of the panels. If currently hiding and
	* `this.useHandle` is `true`, shows handle.
	*
	* @private
	*/
	onSpotlightPanelEnter: function () {
		if (!this.showing && (this.useHandle === true) && this.handleShowing ) {
			Spotlight.spot(this.$.showHideHandle);
			return true;
		}
	},

	/**
	* Sets the index of the active panel, possibly transitioning the panel into view.
	*
	* @param {number} index - Index of the panel to make active.
	* @public
	*/
	setIndex: function (index) {
		// Normally this.index cannot be smaller than 0 and larger than panels.length
		// However, if panels uses handle and there is sequential key input during transition
		// then index could have -1. It means that panels will be hidden.
		if (this.toIndex === null || this.useHandle === false) {
			index = this.clamp(index);
		}

		if (index === this.index || this.toIndex !== null) {
			return;
		}

		// Clear before start
		this.queuedIndex = null;
		this._willMove = null;

		// Set indexes before notify panels
		this.fromIndex = this.index;
		this.toIndex = index;

		this.notifyPanels('initPanel');

		// Ensure any VKB is closed when transitioning panels
		this.blurActiveElementIfHiding(index);

		// If panels will move for this index change, kickoff animation. Otherwise skip it.
		if (this.shouldAnimate()) {
			Spotlight.mute(this);
			// if back key feature is enabled and setIndex is not called from back key handler
			if (this.allowBackKey && !MoonHistory.isHandlingBackAction()) {
				this.panelStack.push(this.index);
				this.pushBackHistory();
			}

			this.startTransition();
			this.addClass('transitioning');
		}

		this._setIndex(this.toIndex);
	},

	/**
	* @private
	*/
	blurActiveElementIfHiding: function (index) {
		var activeElement = document.activeElement,
			activeComponent = activeElement ? dispatcher.$[activeElement.id] : null,
			panels = this.getPanels(),
			panel,
			panelInfo;
		if (activeComponent) {
			for (var i = 0; i < panels.length; i++) {
				panel = panels[i];
				if (activeComponent.isDescendantOf(panel)) {
					panelInfo = this.getTransitionInfo(i, index);
					if (panelInfo.isOffscreen) {
						document.activeElement.blur();
					}
					break;
				}
			}
		}
	},

	/**
	* Returns `true` if the panels should animate in the transition from `fromIndex` to
	* `toIndex`.
	*
	* @private
	*/
	shouldAnimate: function () {
		if (this._willMove == null) {
			/*jshint -W093 */
			return (this._willMove = this.animate && this.shouldArrange() && this.getAbsoluteShowing());
			/*jshint +W093 */
		}
		else {
			return this._willMove;
		}
	},

	/**
	* Returns `true` if any panels will move in the transition from `fromIndex` to `toIndex`.
	*
	* @private
	*/
	shouldArrange: function () {
		return this.layout.shouldArrange ? this.layout.shouldArrange(this.fromIndex, this.toIndex) : true;
	},

	/**
	*
	* @private
	*/
	_setIndex: function (index) {
		var prev = this.get('index');
		this.index = this.clamp(index);
		this.notifyObservers('index', prev, index);
	},

	/**
	* Called when the arranger animation completes.
	*
	* @private
	*/
	animationEnded: function () {
		if (this.animate) {
			this.removeClass('transitioning');
			this.completed();
		} else {
			Panels.prototype.animationEnded.apply(this, arguments);
		}

		return true;
	},

	/**
	* @private
	*/
	getTransitionInfo: function (inPanelIndex) {
		var to = (this.toIndex || this.toIndex === 0) ? this.toIndex : this.index,
			info = {};
		info.isOffscreen = (inPanelIndex != to);
		info.from = this.fromIndex;
		info.to = this.toIndex;
		info.index = inPanelIndex;
		info.animate = this.animate;
		return info;
	},

	/**
	* Set index to breadcrumb to display number
	*
	* @private
	*/
	assignBreadcrumbIndex: function() {
		var range = this.getBreadcrumbRange(),
			control, i;

		if (this.pattern != 'none') {
			for (i=range.start; i<range.end; i++) {
				control = this.getBreadcrumbForIndex(i);
				control.set('index', i);
			}
		}
	},

	/**
	* @private
	*/
	addBreadcrumb: function (forceRender) {
		if (this.pattern == 'none' || !this.$.breadcrumbs) return;

		// If we have 1 panel then we don't need breadcrumb.
		// If we have more then 1 panel then we need panel - 1 number of breadcrumbs.
		// But, if we can only see 1 breadcrumb on screen like activity pattern 
		// then we need 2 breadcrumbs to show animation.
		var len = Math.max(2, Math.min(this.getPanels().length-1, this.getBreadcrumbMax()+1)),
			defs = [], 
			prevLen = this.getBreadcrumbs().length,
			breadcrumbs, i;

		for(i=0; i<len-prevLen; i++) {
			defs[i] = {kind: Breadcrumb};
		}
		this.$.breadcrumbs.createComponents(defs, {owner: this});
		if (forceRender) {
			breadcrumbs = this.getBreadcrumbs();
			for (i=prevLen; i<len; i++) {
				breadcrumbs[i].render();
			}
		}
	},

	/**
	* @private
	*/
	removeBreadcrumb: function () {
		if (this.pattern == 'none' || !this.$.breadcrumbs) return;

		// If we have 1 panel then we don't need breadcrumb.
		// If we have more then 1 panel then we need panel - 1 number of breadcrumbs.
		// But, if we can only see 1 breadcrumb on screen like activity pattern 
		// then we need 2 breadcrumbs to show animation.
		var len = Math.max(2, Math.min(this.getPanels().length-1, this.getBreadcrumbMax()+1)),
			i;

		// If we have more than the number of necessary breadcrumb then destroy.
		while (this.getBreadcrumbs().length > len) {
			this.getBreadcrumbs()[this.getBreadcrumbs().length-1].destroy();
		}
	},

	/**
	* Assign direction property on animator to select proper timing function.
	*
	* @private
	*/
	getDirection: function() {
		return  (this.fromIndex == this.toIndex) ? 'none' : 
				(this.fromIndex < this.toIndex) ? 'forward' : 'backward';
	},

	/**
	* @private
	*/
	adjustFirstPanelBeforeTransition: function() {
		var from = this.fromIndex,
			to = this.toIndex;
		// First panel in activity pattern is using full width
		if (this.pattern == 'activity') {
			if ((from > to && to === 0) || (from === undefined && to === undefined)) {
				this.addClass('first');
				this.$.breadcrumbs.hide();
			}
			if (from < to && from == 0) {
				this.$.breadcrumbs.show();
			}
		}
	},

	/**
	* @private
	*/
	adjustFirstPanelAfterTransition: function(fromIndex, toIndex) {
		if (this.pattern == 'activity' && fromIndex < toIndex && fromIndex == 0) {
			this.removeClass('first');
		}
	},

	/**
	* When index changes, make sure to update the breadcrumbed panel's `spotlight` property
	* (to avoid {@glossary Spotlight} issues).
	*
	* @private
	*/
	indexChanged: function (old) {

		this.assignBreadcrumbIndex();

		// Set animation direction to use proper timing function before start animation
		// This direction is only consumed by MoonAnimator.
		this.$.animator.direction = this.getDirection();	
		
		this.adjustFirstPanelBeforeTransition();

		Panels.prototype.indexChanged.apply(this, arguments);
	},

	/**
	* @private
	*/
	notifyPanels: function (method) {
		var panels = this.getPanels(),
			panel, info, i;
		for (i = 0; (panel = panels[i]); i++) {
			info = this.getTransitionInfo(i);
			if (panel[method]) {
				panel[method](info);
			}
		}
	},

	/**
	* @private
	*/
	processPopOnBack: function(fromIndex, toIndex) {
		var panels = this.getPanels(),
			i, panel, info, popFrom;
		// Automatically pop off panels that are no longer on screen
		if (this.popOnBack && (toIndex < fromIndex)) {
			popFrom = toIndex + 1;
			for (i = 0; (panel = panels[i]); i++) {
				info = this.getTransitionInfo(i);
				// If a panel is onscreen, don't pop it
				if ((i > toIndex) && !info.isOffscreen) {
					popFrom++;
				}
			}

			this.popPanels(popFrom);
		}
	},

	processQueuedKey: function() {
		// queuedIndex becomes -1 when left key input is occurred
		// during transition from index 1 to 0.
		// We can hide panels if we use handle.
		if (this.queuedIndex === -1 && this.useHandle) {
			this.hide();
		} else if (this.queuedIndex !== null) {
			this.setIndex(this.queuedIndex);
		}
	},

	/**
	* @private
	*/
	finishTransition: function () {
		var fromIndex = this.fromIndex,
			toIndex = this.toIndex;

		this.adjustFirstPanelAfterTransition(fromIndex, toIndex);
		this.notifyPanels('transitionFinished');
		Panels.prototype.finishTransition.apply(this, arguments);
		this.processPopOnBack(fromIndex, toIndex);
		this.processQueuedKey();
		Spotlight.unmute(this);
		Spotlight.spot(this.getActive());
	},

	/**
	* Override the default `getShowing()` behavior to avoid setting `this.showing` based on the
	* CSS `display` property.
	*
	* @private
	*/
	getShowing: function () {
		return this.showing;
	},

	/**
	* @private
	*/
	showingChanged: function (inOldValue) {
		if (this.$.backgroundScrim) {
			this.$.backgroundScrim.addRemoveClass('visible', this.showing);
		}
		if (this.useHandle === true) {
			if (this.showing) {
				this.unstashHandle();
				this._show();
				Spotlight.spot(this.getActive());
			}
			else {
				// in this case, our display flag will have been set to none so we need to clear
				// that even though the showing flag will remain false
				this.applyStyle('display', null);
				this.resetHandleAutoHide();
				this._hide();
			}
			this.sendShowingChangedEvent(inOldValue);
		}
		else {
			Panels.prototype.showingChanged.apply(this, arguments);
		}
	},

	/**
	* @private
	*/
	applyPattern: function () {
		switch (this.pattern) {
		case 'alwaysviewing':
		case 'activity':
			this.addClass(this.pattern);
			this.useHandle = (this.useHandle === 'auto') ? true : this.useHandle;
			this.createChrome(this.handleTools);
			this.tools = this.animatorTools;
			break;
		default:
			this.useHandle = false;
			break;
		}
	},

	/**
	* @private
	*/
	initializeShowHideHandle: function () {
		if (this.useHandle === true) {
			this.$.showHideHandle.canGenerate = true;
			this.$.showHideHandle.spotlight = true;
		}
	},

	/**
	* Shows panels with transition from right.
	*
	* @private
	*/
	_show: function () {
		var init = false;
		if (!this.hasNode()) {
			init = true;
		} else {
			this.$.showHideHandle.addClass('right');
			this.applyShowAnimation();
		}
		Signals.send('onPanelsShown', {initialization: init});
	},

	/**
	* Hides panels with transition to right.
	*
	* @private
	*/
	_hide: function () {
		if (!this.hasNode()) {
			return;
		}
		this.$.showHideHandle.removeClass('right');
		this.applyHideAnimation();
		this.panelsHiddenAsync();
	},

	/**
	* Sets show state without animation.
	*
	* @private
	*/
	_directShow: function () {
		this.$.showHideHandle.addClass('right');
		if (this.handleShowing) {
			this.$.showHideHandle.removeClass('hidden');
		}
		this.applyShowAnimation(true);
	},

	/**
	* Sets hide state without animation.
	*
	* @private
	*/
	_directHide: function () {
		this.$.showHideHandle.addClass('hidden');
		this.$.showHideHandle.removeClass('right');
		this.applyHideAnimation(true);
		this.hideAnimationComplete();
	},

	/**
	* @private
	*/
	applyShowAnimation: function (direct) {
		this.$.clientWrapper.applyStyle('transition', direct ? null : 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)');
		this.$.clientWrapper.applyStyle('-webkit-transition', direct ? null : '-webkit-transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)');
		dom.transform(this.$.clientWrapper, {translateX: 0});
	},

	/**
	* @private
	*/
	applyHideAnimation: function (direct) {
		this.$.clientWrapper.applyStyle('transition', direct ? null : 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)');
		this.$.clientWrapper.applyStyle('-webkit-transition', direct ? null : '-webkit-transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)');
		dom.transform(this.$.clientWrapper, {translateX: '100%'});
	},

	/**
	* Hide/show animation complete.
	*
	* @private
	*/
	showHideAnimationComplete: function (sender, event) {
		switch (event.animation.name) {
		case 'show':
			this.showAnimationComplete();
			return true;
		case 'hide':
			this.hideAnimationComplete();
			return true;
		}
	},

	/**
	* @private
	*/
	showAnimationComplete: function () {
		if (this.handleShowing) {
			this.$.showHideHandle.removeClass('hidden');
		}
	},

	/**
	* @private
	*/
	hideAnimationComplete: function () {
		if (this.handleShowing) {
			this.$.showHideHandle.removeClass('hidden');
		}
	},

	/**
	* @private
	*/
	animateChanged: function () {
		this.addRemoveClass('moon-composite', this.animate);
	},

	/**
	* @private
	*/
	backKeyHandler: function () {
		if (this.panelStack.length) {
			this.setIndex(this.panelStack.pop());
		}
		return true;
	},

	/**
	* @private
	*/
	allowBackKeyChanged: function () {
		if (this.allowBackKey) {
			//initialize stack
			this.panelStack = [];
		} else if(this.panelStack) {
			this.panelStack = null;
		}
	}

});
