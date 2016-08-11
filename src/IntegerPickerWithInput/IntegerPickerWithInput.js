require('moonstone');

/**
 * Contains the declaration for the {@link module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker} kind.
 * @module moonstone/SimpleIntegerPicker
 */

var
    kind = require('enyo/kind'),
    dom = require('enyo/dom');

var
    Spot = require('spotlight'),
    IntegerPicker = require('./IntegerPicker');


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
