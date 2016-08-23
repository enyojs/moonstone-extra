require('moonstone');

/**
 * Contains the declaration for the {@link module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker} kind.
 * @module moonstone/SimpleIntegerPicker
 */

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom');

var
	IntegerPicker = require('../IntegerPicker');

var
	$L = require('../i18n');

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
		classes: 'moon-simple-integer-picker',

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
			onSpotlightKeyDown: 'fireSpotKeyDown',
			onInputEnter: 'checkInputEnter',
			onBackEnter: 'inputBlur',
			onleave: 'firePointerLeave',
			ontap: 'selectByTap',
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
		/**
		 * Fires when the pointer moves away from a picker and keeps the focus in the input field
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.firePointerLeave
		 * @private
		 * @method
		 */
		firePointerLeave: function() {
			if (!this.$.item.hasNode()) {
				// development is in-progress
				// console.log("no node");
			} else {
				// development is in-progress
				// console.log("has node");
			}
		},
		/**
		 * Enables the input field on direct input from the number keys
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.fireSpotKeyDown
		 * @private
		 * @method
		 */
		fireSpotKeyDown: function(inSender, inEvent) {
			var keyCode;
			keyCode = inEvent.keyCode;
			if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105) || (keyCode === 107 || keyCode === 109)) {
				this.prepareInputField();
			}
		},
		/**
		 * Enables the input field on enter key press
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.fireSelectEvent
		 * @private
		 * @method
		 */
		fireSelectEvent: function(inSender, inEvent) {
			this.prepareInputField();

			if (this.hasNode()) {
				this.doSelect({
					content: this.labelForValue(this.value),
					value: this.value
				});
			}
		},
		/**
		 * Creates node for the input field and brings focus to the input field
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.prepareInputField
		 * @private
		 * @method
		 */
		prepareInputField: function() {
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
			}
		},
		/**
		 * Validates the value of input field and sets the value to picker
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.checkInputEnter
		 * @private
		 * @method
		 */
		checkInputEnter: function() {
			var valueInputted, tempValue, item;
			item = this.$.item;
			valueInputted = parseInt(this.$.item.value);
			tempValue = this.$.item.tempValue;
			if (valueInputted && valueInputted <= this.max && valueInputted >= this.min && valueInputted !== tempValue) {
				this.removeStyle();
				this.setValue(parseInt(valueInputted));
				item.blur();
			} else {
				this.inputBlur();
			}
		},
		/**
		 *  Disables the input field when the focus is lost from the input field
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.inputBlur
		 * @private
		 * @method
		 */
		inputBlur: function(inSender, inEvent) {
			var tempValue, item;
			tempValue = this.$.item.tempValue;
			item = this.$.item;
			this.removeStyle();
			item.setValue(tempValue);
			item.blur();
		},
		/**
		 *  Disables the input field when the spotlight blurs
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.fireSpotBlur
		 * @private
		 * @method
		 */
		fireSpotBlur: function(inSender, inEvent) {
			var tempValue, item;
			tempValue = this.$.item.tempValue;
			item = this.$.item;
			this.removeStyle();
			item.setValue(tempValue);
			item.blur();
		},
		/**
		 *  Changes the styling when input field is enabled
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.styleChange
		 * @private
		 * @method
		 */
		styleChange: function() {
			var item;
			item = this.$.item;
			this.addClass("selectedPicker");
			this.$.item.addClass("selectedPickerItem");
			this.$.nextOverlay.addClass("arrowColor");
			this.$.previousOverlay.addClass("arrowColor");
		},
		/**
		 *  Removes the styling when input field is disabled
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.removeStyle
		 * @private
		 * @method
		 */
		removeStyle: function() {
			var item;
			item = this.$.item;
			this.removeClass("selectedPicker");
			this.$.item.removeClass("selectedPickerItem");
			this.$.nextOverlay.removeClass("arrowColor");
			this.$.previousOverlay.removeClass("arrowColor");
		},
		/**
		 *  Enable the input field by tap on the picker's input area
		 * 
		 * @see module:moonstone/IntegerPicker~IntegerPicker.selectByTap
		 * @private
		 * @method         
		 */
		selectByTap: function(inSender, inEvent) {
			// development in-progress
			// console.log("selectByTap");
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
