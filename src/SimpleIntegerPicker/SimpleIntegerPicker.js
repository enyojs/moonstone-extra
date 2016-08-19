require('moonstone');

/**
 * Contains the declaration for the {@link module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker} kind.
 * @module moonstone/SimpleIntegerPicker
 */

var
    kind = require('enyo/kind'),
    dom = require('enyo/dom');

var
    Spot = require('spotlight');
var
    animation = require('enyo/animation'),
    Control = require('enyo/Control'),
    Spotlight = require('spotlight'),
    Scroller = require('enyo/Scroller');

var
    FlyweightRepeater = require('layout/FlyweightRepeater'),
    Input = require('moonstone/Input');

var
    ScrollStrategy = require('moonstone/ScrollStrategy'),
    TouchScrollStrategy = ScrollStrategy.Touch;

var
    $L = require('moonstone/i18n');

var IntegerPicker= kind(
    /** @lends module:moonstone/IntegerPicker~IntegerPicker.prototype */
    {

        /**
         * @private
         */
        name: 'moon.IntegerPickerModified',

        /**
         * @private
         */
        kind: Control,

        /**
         * @private
         */
        classes: 'moon-scroll-picker-container',

        /**
         * @private
         * @lends module:moonstone/IntegerPicker~IntegerPicker.prototype
         */
        published: {
            /**
             * When `true`, button is shown as disabled and does not generate tap events.
             *
             * @type {Boolean}
             * @default false
             * @public
             */
            disabled: false,

            /**
             * When `true`, picker transitions animate left/right.
             *
             * @type {Boolean}
             * @default true
             * @public
             */
            animate: true,

            /**
             * Current value of the picker.
             *
             * @type {Number}
             * @default 0
             * @public
             */
            value: 0,

            /**
             * Minimum value of the picker.
             *
             * @type {Number}
             * @default 0
             * @public
             */
            min: 0,

            /**
             * Maximum value of the picker.
             *
             * @type {Number}
             * @default 9
             * @public
             */
            max: 9,

            /**
             * Amount by which to increment or decrement when moving picker between
             * [min]{@link module:moonstone/IntegerPicker~IntegerPicker#min} and [max]{@link module:moonstone/IntegerPicker~IntegerPicker#max}.
             *
             * @type {Number}
             * @default 1
             * @public
             */
            step: 1,

            /**
             * If a number is specified, the picker value is displayed as this many
             * zero-filled digits.
             *
             * @type {Number}
             * @default null
             * @public
             */
            digits: null,

            /**
             * When `true`, incrementing beyond [max]{@link module:moonstone/IntegerPicker~IntegerPicker#max} will wrap to
             * [min]{@link module:moonstone/IntegerPicker~IntegerPicker#min}, and decrementing beyond `min` will wrap to
             * `max`.
             *
             * @type {Boolean}
             * @default false
             * @public
             */
            wrap: false,

            /**
             * The minimum width of the picker. If not set, or set to a low value, the width
             * of the picker will fluctuate slightly depending on the rendered width of the value.
             *
             * @type {Number}
             * @default 50
             * @public
             */
            minWidth: 50

        },

        /**
         * @private
         */
        handlers: {
            onSpotlightUp: 'next',
            onSpotlightDown: 'previous',
            onSpotlightFocused: 'spotlightFocused',
            onSpotlightBlur: 'spotlightBlur',
            onSpotlightScrollUp: 'next',
            onSpotlightScrollDown: 'previous',
            onmousewheel: 'mousewheel',
        },

        /**
         * @private
         */
        events: {
            /**
             * {@link module:moonstone/IntegerPicker~IntegerPicker#onChange}
             */
            onChange: '',
            onInputEnter: '',
            onBackEnter: ''
        },

        /**;
         * @private
         */
        spotlight: true,

        /**
         * Cache scroll bounds so we don't have to run {@link module:enyo/Scroller~Scroller#stop} every time we
         * need them.
         *
         * @private
         */
        scrollBounds: {},

        /**
         * @private
         */
        components: [{
                name: 'nextOverlay',
                kind: Control,
                ondown: 'downNext',
                onholdpulse: 'next',
                classes: 'moon-scroll-picker-overlay-container1 next',
                components: [
                    { kind: Control, name: "nextButton", classes: 'moon-scroll-picker-overlay nextRight' },
                    { kind: Control, classes: 'moon-scroll-picker-taparea' }
                ]
            },
            // FIXME: TranslateScrollStrategy doesn't work with the current design of this component so
            // we're forcing TouchScrollStrategy
            {
                kind: Scroller,
                strategyKind: TouchScrollStrategy,
                thumb: false,
                touch: true,
                useMouseWheel: false,
                classes: 'moon-scroll-picker ',
                components: [{
                        name: 'repeater',
                        kind: FlyweightRepeater,
                        classes: 'moon-scroll-picker-repeater',
                        ondragstart: 'dragstart',
                        onSetupItem: 'setupItem',
                        noSelect: true,
                        handlers: {
                            onRenderRow: 'renderRowFunc',

                        },
                        components: [
                            { name: 'item', kind: Input, onkeyup: 'keyUp', onblur: 'inputBlur', classes: 'moon-scroll-picker-item customInputStyle' }
                        ]
                    },
                    { name: 'buffer', kind: Control, accessibilityDisabled: true, classes: 'moon-scroll-picker-buffer' }
                ]
            }, {
                name: 'previousOverlay',
                kind: Control,
                ondown: 'downPrevious',
                onholdpulse: 'previous',
                classes: 'moon-scroll-picker-overlay-container1 previous',
                components: [
                    { kind: Control, name: "prevButton", classes: 'moon-scroll-picker-overlay previousLeft' },
                    { kind: Control, classes: 'moon-scroll-picker-taparea' }
                ]
            }
        ],
        keyUp: function(s, e) {
            if (e.keyCode === 13) {
                this.doInputEnter();
            } else if (e.keyCode === 8 || e.keyCode === 461) {
                this.$.item.removeClass("selectedPickerItem");
                this.doBackEnter();
            }
        },
        inputBlur: function() {
            // this.doBackEnter();
        },
        /**
         * Parameter that determines scroll math simulation speed.
         *
         * @private
         */
        scrollFrame: 3,

        /**
         * Indicates direction of change from user. Necessary to support proper wrapping
         * when `range == 2`.
         *
         * @private
         */
        direction: 0,

        /**
         * Range of possible values `max - min`.
         *
         * @private
         */
        range: 0,

        /**
         * @private
         */
        create: function() {
            Control.prototype.create.apply(this, arguments);
            this.rangeChanged();
            this.updateOverlays();
        },
        renderRowFunc: function() {

            console.log('rendered');
        },
        prepareRowFunc: function() {
            console.log('prepareRow');
        },
        /**
         * @private
         */
        rendered: function() {
            Control.prototype.rendered.apply(this, arguments);
            this.width = null;
            this.minWidthChanged();
            this.scrollToValue();
            this.$.scroller.getStrategy().setFixedTime(false);
            this.$.scroller.getStrategy().setFrame(this.scrollFrame);
        },
        tappedButton: function() {
            console.log('inside button');
        },
        /**
         * Snap to current value on a reflow.
         *
         * @private
         */
        reflow: function() {
            Control.prototype.reflow.apply(this, arguments);
            this.scrollToValue();
        },

        /**
         * @private
         */
        getVerifiedValue: function() {
            return this.value >= this.min && this.value <= this.max ? this.value : this.min;
        },

        /**
         * @private
         */
        verifyValue: function() {
            var animate = this.animate;
            this.animate = false;
            this.set('value', this.getVerifiedValue());
            this.animate = animate;
        },

        /**
         * @private
         */
        setupItem: function(inSender, inEvent) {
            var index = inEvent.index;
            var content = this.labelForValue(this.indexToValue(index % this.range));
            this.$.item.setValue(content);
        },

        /**
         * Formats passed-in value for display. If [digits]{@link module:moonstone/IntegerPicker~IntegerPicker#digits}
         * is **truthy**, zeros will be prepended to reach that number of digits.
         *
         * @param  {Number} value - Value to format.
         * @return {String}       - Formatted value.
         * @private
         */
        labelForValue: function(value) {
            if (this.digits) {
                value = (value < 0 ? '-' : '') + ('00000000000000000000' + Math.abs(value)).slice(-this.digits);
            }

            return value;
        },

        /**
         * @private
         */
        setupBuffer: function() {
            var bmin = ('' + this.min).length,
                bmax = Math.max(bmin, ('' + this.max).length),
                digits = this.digits + (this.min < 0 ? 1 : 0),
                buffer = Math.max(bmax, digits),
                content = '00000000000000000000'.substring(0, buffer);
            this.$.buffer.setContent(content);
        },

        /**
         * @private
         */
        digitsChanged: function() {
            this.setupBuffer();
        },

        /**
         * @private
         */
        prepareRange: function() {
            this.range = this.valueToIndex(this.max) - this.valueToIndex(this.min) + 1;
            this.setupBuffer();
        },

        /**
         * @private
         */
        rangeChanged: function() {
            this.verifyValue();
            this.prepareRange();
        },

        /**
         * Fail-safe design.
         * If out-of-boundary value is assigned, adjust boundary.
         *
         * @private
         */
        valueChanged: function(old) {
            this.value -= (this.value - this.min) % this.step;
            if (this.value < this.min) {
                this.setMin(this.value);
            } else if (this.value > this.max) {
                this.setMax(this.value);
            }

            this.scrollToValue(old);
            this.updateOverlays();
            this.fireChangeEvent();
        },

        stepChanged: function(old) {
            var step = parseInt(this.step, 10);
            this.step = isNaN(step) ? 1 : step;
            this.prepareRange();
            this.valueChanged(this.value);
        },

        /**
         * @private
         */
        disabledChanged: function() {
            this.addRemoveClass('disabled', this.disabled);
        },

        /**
         * @private
         */
        wrapChanged: function() {
            this.updateOverlays();
        },

        /**
         * Prevent scroller dragging
         *
         * @private
         */
        dragstart: function(inSender, inEvent) {
            return true;
        },

        /**
         * @private
         */
        minChanged: function() {
            this.rangeChanged();
        },

        /**
         * @private
         */
        maxChanged: function() {
            this.rangeChanged();
        },

        /**
         * @private
         */
        previous: function(inSender, inEvent) {
            if (this.disabled) {
                return;
            }

            this.direction = -1;

            if (this.value - this.step >= this.min) {
                this.$.item.removeClass("selectedPickerItem");
                this.setValue(this.value - this.step);
            } else if (this.wrap) {
                this.setValue(this.max);
            } else {
                return;
            }
            this.$.previousOverlay.addClass('selected');
            if (inEvent.originator != this.$.upArrow) {
                this.startJob('hideBottomOverlay', 'hideBottomOverlay', 350);
            }

            this.direction = 0;
            return true;
        },

        /**
         * @private
         */
        next: function(inSender, inEvent) {

            if (this.disabled) {
                return;
            }

            this.direction = 1;

            if (this.value + this.step <= this.max) {
                this.$.item.removeClass("selectedPickerItem");
                this.setValue(this.value + this.step);
            } else if (this.wrap) {
                this.setValue(this.min);
            } else {
                return;
            }
            this.$.nextOverlay.addClass('selected');
            if (inEvent.originator != this.$.downArrow) {
                this.startJob('hideTopOverlay', 'hideTopOverlay', 350);
            }

            this.direction = 0;
            return true;
        },

        /**
         * @private
         */
        downPrevious: function(inSender, inEvent) {
            this.previous(inSender, inEvent);
        },

        /**
         * @private
         */
        downNext: function(inSender, inEvent) {
            this.next(inSender, inEvent);
        },

        /**
         * @private
         */
        updateOverlays: function() {
            this.$.previousOverlay.applyStyle('visibility', (this.wrap || this.value - this.step >= this.min) ? 'visible' : 'hidden');
            this.$.nextOverlay.applyStyle('visibility', (this.wrap || this.value + this.step <= this.max) ? 'visible' : 'hidden');
        },

        /**
         * Renders the repeater.
         *
         * @param {Number} index - Index of row.
         * @param {Number} count - Number of rows to render.
         * @private
         */
        updateRepeater: function(index, count) {
            this.$.repeater.set('rowOffset', index);
            this.$.repeater.set('count', count || 1);
            this.$.repeater.render();
            this.$.scroller.remeasure();
        },

        /**
         * Scrolls to the node at `index` if it exists.
         *
         * @param  {Number} index    - Index of row.
         * @param  {Boolean} animate - If `true`, scroll is animated.
         * @private
         */
        scrollToIndex: function(index, animate) {
            var node = this.$.repeater.fetchRowNode(index);
            if (node) {
                if (animate) {
                    this.$.scroller.scrollTo(node.offsetLeft, node.offsetTop);
                } else {
                    this.$.scroller.setScrollTop(node.offsetTop);
                    this.$.scroller.setScrollLeft(node.offsetLeft);
                }
            }
        },

        /**
         * Converts `value` to its index in the repeater.
         *
         * @param  {Number} value - Integer value.
         * @return {Number}       - Repeater index.
         * @private
         */
        valueToIndex: function(value) {
            return Math.floor((value - this.min) / this.step);
        },

        /**
         * Converts a repeater `index` to its value.
         *
         * @param  {Number} index - Repeater index
         * @return {Number}       - Integer value
         * @private
         */
        indexToValue: function(index) {
            return index * this.step + this.min;
        },

        /**
         * Sets up the repeater to render the rows between `old` and
         * [value]{@link module:moonstone/IntegerPicker~IntegerPicker#value} and scrolls to reveal the current value. If `old`
         * is specified, the scroll will be animated. If [wrap]{@link module:moonstone/IntegerPicker~IntegerPicker#wrap} is
         * `true`, the scroll will travel the shortest distance to `value`, which may result in
         * wrapping.
         *
         * @param  {Number} [old] - Prior value from which to scroll.
         * @private
         */
        scrollToValue: function(old) {
            var newIndex = this.valueToIndex(this.value);

            if (this.animate && old !== undefined) {
                var oldIndex = this.valueToIndex(old);
                var delta = newIndex - oldIndex;

                if (this.wrap && Math.abs(delta) >= this.range / 2) {

                    // when range is 2, we need special logic so scrolling matches the user's action
                    // (e.g. tapping the up arrow always scrolls up). If direction (set in next()
                    // and previous()) === delta (which will always be +/- 1), the natural rendering
                    // is correct even though we're wrapping around the boundary so don't adjust.
                    if (!(this.range === 2 && this.direction !== delta)) {
                        // if wrapping and wrapping is a shorter distance, adjust the lesser index by the
                        // range so the distance is the shortest possible
                        if (newIndex > oldIndex) {
                            oldIndex += this.range;
                        } else {
                            newIndex += this.range;
                        }
                    }
                }

                // rowOffset should be the lesser of the indices and count is the difference + 1
                var index = Math.min(oldIndex, newIndex);
                var count = Math.abs(newIndex - oldIndex) + 1;
                this.updateRepeater(index, count);

                if (this._rAF) animation.cancelAnimationFrame && animation.cancelAnimationFrame(this._rAF);

                this._rAF = animation.requestAnimationFrame(function() {
                    this.scrollToIndex(oldIndex, false);
                    this._rAF = animation.requestAnimationFrame(function() {
                        this.scrollToIndex(newIndex, true);
                    }.bind(this));
                }.bind(this));
            } else {
                // if old isn't specified, setup the repeater with only this.value and jump to it
                this.updateRepeater(newIndex);
                this.scrollToIndex(newIndex, false);
            }
        },

        /**
         * @private
         */
        hideTopOverlay: function() {
            this.$.nextOverlay.removeClass('selected');
        },

        /**
         * @private
         */
        hideBottomOverlay: function() {
            this.$.previousOverlay.removeClass('selected');
        },

        /**
         * @fires module:moonstone/IntegerPicker~IntegerPicker#onChange
         * @private
         */
        fireChangeEvent: function() {
            this.doChange({
                name: this.name,
                value: this.value,
                content: this.labelForValue(this.value)
            });
        },

        /**
         * @private
         */
        resetOverlay: function() {
            this.hideTopOverlay();
            this.hideBottomOverlay();
        },

        /**
         * @fires module:moonstone/Scroller~Scroller#onRequestScrollIntoView
         * @private
         */
        spotlightFocused: function() {
            this.set('spotted', true);
            this.bubble('onRequestScrollIntoView');
        },

        /**
         * @private
         */
        spotlightBlur: function() {
            this.set('spotted', false);
            this.hideTopOverlay();
            this.hideBottomOverlay();
        },

        /**
         * Cache scroll bounds in [scrollBounds]{@link module:moonstone/IntegerPicker~IntegerPicker#scrollBounds} so we
         * don't have to call {@link module:enyo/Scroller~Scroller#stop} to retrieve them later.
         *
         * @private
         */
        updateScrollBounds: function() {
            this.scrollBounds = this.$.scroller.getStrategy()._getScrollBounds();
        },

        /**
         * Silently scrolls to the `inValue` y-position without animating.
         *
         * @private
         */
        setScrollTop: function(inValue) {
            this.$.scroller.setScrollTop(inValue);
        },

        /**
         * Ensures scroll position is in bounds.
         *
         * @private
         */
        stabilize: function() {
            this.$.scroller.stabilize();
        },

        /**
         * @private
         */
        mousewheel: function(inSender, inEvent) {
            // Make sure scrollers that container integer pickers don't scroll
            inEvent.preventDefault();
            return true;
        },

        /**
         * @private
         */
        minWidthChanged: function() {
            this.applyStyle('min-width', dom.unit(this.minWidth));
        },

        /**
         * @method
         * @private
         */
        showingChangedHandler: function() {
            Control.prototype.showingChangedHandler.apply(this, arguments);

            // Only force a scroll to the item corresponding to the current value if it is not
            // already displayed.
            if (this.showing && !this.$.repeater.fetchRowNode(this.valueToIndex(this.value))) {
                this.scrollToValue();
            }
        },

        // Accessibility

        /**
         * @default 'spinbutton'
         * @type {String}
         * @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
         * @public
         */
        accessibilityRole: 'spinbutton',

        /**
         * Custom value for accessibility (ignored if `null`).
         *
         * @type {String|null}
         * @default null
         * @public
         */
        accessibilityValueText: null,

        /**
         * @private
         */
        ariaObservers: [
            { from: 'min', to: 'aria-valuemin' },
            { from: 'max', to: 'aria-valuemax' }, {
                path: ['accessibilityValueText', 'value'],
                method: function() {
                    this.set('accessibilityHint', null);
                    this.ariaValue();
                }
            }, {
                path: 'spotted',
                method: function() {
                    // When spotlight is focused, it reads value with hint
                    if (this.spotted) {
                        if (!this.wrap && this.value == this.min) {
                            this.set('accessibilityHint', $L('change a value with up button'));
                        } else if (!this.wrap && this.value == this.max) {
                            this.set('accessibilityHint', $L('change a value with down button'));
                        } else {
                            this.set('accessibilityHint', $L('change a value with up down button'));
                        }
                    }
                }
            }
        ],

        /**
         * @private
         */
        ariaValue: function() {
            var text = this.accessibilityValueText || this.value;
            this.setAriaAttribute('aria-valuetext', text);
        }
    });
/**
 * Fires when the currently selected item changes.
 *
 * @event module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker#onChange
 * @type {Object}
 * @property {Number} value - The value of the currently selected item.
 * @property {String} content - The content of the currently selected item.
 * @public
 */

/**
 * Fires in response to Return keypress while the picker has focus in
 * {@glossary Spotlight} 5-way mode.
 *
 * @event module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker#onSelect
 * @type {Object}
 * @property {Number} value - The value of the currently selected item.
 * @property {String} content - The content of the currently selected item.
 * @public
 */

/**
 * Fires when the picker is rebuilt, allowing other controls the opportunity to reflow
 * the picker as necessary (e.g., a child of a {@link module:moonstone/ExpandableIntegerPicker~ExpandableIntegerPicker} may
 * need to be reflowed when the picker is opened, as it may not be currently visible).
 * No event-specific data is sent with this event.
 *
 * @event module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker#onRebuilt
 * @type {Object}
 * @public
 */

/**
 * {@link module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker} is a [control]{@link module:enyo/Control~Control} that prompts the
 * user to make a selection from a range of integer-based options.
 *
 * The picker may be changed programmatically by calling
 * [previous()]{@link module:moonstone/IntegerPicker~IntegerPicker#previous} or
 * [next()]{@link module:moonstone/IntegerPicker~IntegerPicker#next}, or by modifying the published property
 * [value]{@link module:moonstone/IntegerPicker~IntegerPicker#value}.
 *
 * @class SimpleIntegerPicker
 * @extends module:enyo/Control~Control
 * @ui
 * @public
 */


module.exports = kind(
    /** @lends module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker.prototype */
    {

        /**
         * @private
         */
        name: 'moon.SimpleIntegerPicker',

        /**
         * @private
         */
        kind: IntegerPicker,

        /**
         * @private
         */
        classes: 'moon-simple-integer-picker1 customStylePicker',

        /**
         * @private
         */
        spotlight: true,

        /**
         * @private
         */
        events: {
            onSelect: ''
        },

        /**
         * @private
         */
        handlers: {
            onSpotlightUp: null,
            onSpotlightDown: null,
            onSpotlightRight: 'next',
            onSpotlightLeft: 'previous',
            onSpotlightSelect: 'fireSelectEvent',
            onSpotlightBlur: 'fireSpotBlur',
            /*onSpotlightKeyUp: 'fireSpotKeyUp',
            onSpotlightKeyDown: 'fireSpotKeyDown',*/
            onInputEnter: 'checkInputEnter',
            onBackEnter: 'inputBlur'
        },

        /**
         * @lends module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker.prototype
         * @private
         * @lends module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker.prototype
         */
        published: {

            /**
             * Unit label to be appended to the value for display.
             *
             * @type {String}
             * @default 'sec'
             * @public
             */
            unit: 'sec'
        },

        /**
         * Number of pixels added to the width of each picker item as padding. Note that this
         * is not a CSS padding value.
         *
         * @type {Number}
         * @default 60
         * @public
         */
        itemPadding: 60,

        /**
         * Appends unit to content, forming label for display.
         *
         * @see module:moonstone/IntegerPicker~IntegerPicker.labelForValue
         * @private
         * @method
         */
        labelForValue: function(value) {
            var content = IntegerPicker.prototype.labelForValue.apply(this, arguments);
            return this.unit ? content + ' ' + this.unit : content;
        },

        /**
         * @private
         */
        unitChanged: function() {
            this.valueChanged();
        },

        /**
         * Calculates width of the picker when the first item is rendered.
         *
         * @see module:moonstone/IntegerPicker~IntegerPicker.updateRepeater
         * @private
         * @method
         */
        updateRepeater: function() {
            IntegerPicker.prototype.updateRepeater.apply(this, arguments);

            if (!this.width) {
                var ib;
                this.$.repeater.performOnRow(this.$.repeater.rowOffset, function() {
                    // have to reset to natural width before getting bounds
                    this.$.item.setStyle('width: auto');
                    ib = this.$.item.getBounds();
                }, this);

                this.width = ib.width + this.itemPadding;
                this.applyStyle('width', dom.unit(this.width, 'rem'));
                this.$.item.setStyle('width: ' + dom.unit(this.width, 'rem'));
            }
        },
        /*createDashes: function(num) {
            var i = 1;
            var j = "-";
            var num = num;
            while (i < num) {
                j = j + "-";
                i = i + 1;
            }
            return j;
        },*/
        /*fireSpotKeyUp: function(e) {
            var itemVal = this.$.item.value.toString();
            console.log(itemVal);
            // if (itemVal >= this.min && itemVal <= this.max) {
                var x = itemVal.substr("--");
                console.log(x);
            // }
            // itemVal = itemVal.replace("-", "a");
            // console.log(itemVal);
        },*/
        /* fireSpotKeyDown: function(inSender, inEvent) {
             var keyCode, index, repeater, item, lengthOfNum, dashes;
             keyCode = inEvent.keyCode;
             if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) {
                 index = this.valueToIndex(this.value);
                 repeater = this.$.repeater;
                 item = this.$.item;
                 console.log(item.value);
                 if (!this.$.item.hasNode() || this.$.item.hasFocus() != true) {
                     console.log("inside" + item.value);
                     this.setStyle("background-color", "#fff !important");
                     item.tempValue = item.value;
                     this.previousIndex = index;
                     repeater.renderRow(index);
                     repeater.prepareRow(index);
                     lengthOfNum = this.max.toString().length;
                     dashes = this.createDashes(lengthOfNum - 1);
                     item.setValue(dashes);
                     item.focus();
                     item.setAttribute('placeholder', this.min + ' - ' + this.max);
                     console.log(this.$.item.value);
                 }
             }
         },*/

        /**
         * @fires module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker#onSelect
         * @private
         */
        fireSelectEvent: function(inSender, inEvent) {
            var keyCode, index, repeater, item, lengthOfNum, dashes;
            keyCode = inEvent.keyCode;
            index = this.valueToIndex(this.value);
            repeater = this.$.repeater;
            item = this.$.item;
            if (!this.$.item.hasNode() || this.$.item.hasFocus() != true) {
                this.previousIndex = index;
                repeater.renderRow(index);
                repeater.prepareRow(index);
                this.styleChange();
                item.tempValue = item.value;
                item.setValue(null);
                item.focus();
                item.setAttribute('placeholder', this.min + ' to ' + this.max);
            }

            if (this.hasNode()) {
                this.doSelect({
                    content: this.labelForValue(this.value),
                    value: this.value
                });
            }
        },
        checkInputEnter: function() {
            var valueInputted, tempValue, item;
            item = this.$.item;
            valueInputted = this.$.item.value;
            tempValue = this.$.item.tempValue;
            if (valueInputted && valueInputted <= this.max && valueInputted >= this.min) {
                this.removeStyle();
                this.setValue(parseInt(valueInputted));
                item.blur();
            } else {
                item.setValue(null);
                item.setAttribute('placeholder', this.min + ' to ' + this.max);
                // item.blur();
            }
            return true;
        },
        inputBlur: function(inSender, inEvent) {
            var tempValue, item;
            tempValue = this.$.item.tempValue;
            item = this.$.item;
            this.removeStyle();
            item.setValue(tempValue);
            item.blur();
        },
        fireSpotBlur: function(inSender, inEvent) {
            var tempValue, item;
            tempValue = this.$.item.tempValue;
            item = this.$.item;
            this.removeStyle();
            item.setValue(tempValue);
            item.blur();

        },
        styleChange: function() {
            var item;
            item = this.$.item;
            this.addClass("selectedPicker");
            this.$.item.addClass("selectedPickerItem");
            this.$.nextOverlay.addClass("arrowColor");
            this.$.previousOverlay.addClass("arrowColor");
        },
        removeStyle: function() {
            var item;
            item = this.$.item;
            this.removeClass("selectedPicker");
            this.$.item.removeClass("selectedPickerItem");
            this.$.nextOverlay.removeClass("arrowColor");
            this.$.previousOverlay.removeClass("arrowColor");
        },

        /**
         * Forces recalculation of the width of the picker.
         *
         * @see module:enyo/UiComponent~UiComponent.reflow
         * @private
         * @method
         */
        reflow: function() {
            this.width = 0;
            IntegerPicker.prototype.reflow.apply(this, arguments);
        },

        // Accessibility

        /**
         * @private
         */
        ariaObservers: [{
            path: 'unit',
            method: function() {
                this.set('accessibilityHint', null);
                this.ariaValue();
            }
        }, {
            path: 'spotted',
            method: function() {
                // When spotlight is focused, it reads value with hint
                if (this.spotted) {
                    if (!this.wrap && this.value == this.min) {
                        this.set('accessibilityHint', $L('change a value with right button'));
                    } else if (!this.wrap && this.value == this.max) {
                        this.set('accessibilityHint', $L('change a value with left button'));
                    } else {
                        this.set('accessibilityHint', $L('change a value with left right button'));
                    }
                }
            }
        }],

        /**
         * @private
         */
        ariaValue: function() {
            var text = this.accessibilityValueText ||
                (this.unit ? this.value + ' ' + this.unit : this.value);
            this.setAriaAttribute('aria-valuetext', text);
        }
    });
