require('moonstone');

/**
 * Contains the declaration for the {@link module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker} kind.
 * @module moonstone/SimpleIntegerPicker
 */

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom');

var
	Control = require('enyo/Control'),
	Input = require('moonstone/Input'),
	Spotlight = require('spotlight'),
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
	/** @lends module:moonstone/SimpleIntegerPicker~SimpleIntegerPicker.prototype */ {

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
		onSpotlightRight: 'next',
		onSpotlightLeft: 'previous',
		onSpotlightUp: 'spotUp',
		onSpotlightDown: 'spotDown',
		onSpotlightSelect: 'fireSelectEvent',
		onSpotlightKeyDown: 'fireSpotKeyDown',
		onInputEnter: 'checkInputEnter',
		onBackEnter: 'inputBlur',
		ontap: 'selectByTap',
		onblur: 'onBlur',
		onresize:'handleResize'
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
	 * The components which are to be placed inside the repeater
	 * @private
	 * @type {Array}
	 */
	tools:[
		{name: 'item', kind: Input, classes: 'moon-scroll-picker-item', showing: false, onkeyup: 'triggerCustomEvent'},
		{name: 'measureItem', kind: Control, classes: ' moon-scroll-picker-item enyo-input moon-body-text moon-input'},
		{name: 'buffer', kind: Control, accessibilityDisabled: true, classes: 'moon-scroll-picker-buffer'}
	],

	/**
	 * Appends unit to content, forming label for display.
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.labelForValue
	 * @private
	 * @method
	 */
	labelForValue: function (value) {
		var content = IntegerPicker.prototype.labelForValue.apply(this, arguments);
		return this.unit ? content + ' ' + this.unit : content;
	},

	/**
	* @private
	*/
	setupItem: function (sender, ev) {
		var index = ev.index;
		var content = this.labelForValue(this.indexToValue(index % this.range));
		this.$.item.set('value', content);
		this.$.measureItem.set('content', content);
	},

	/**
	 * @private
	 */
	unitChanged: function () {
		this.valueChanged();
	},

	/**
	 * Calculates width of the picker when the first item is rendered.
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.updateRepeater
	 * @private
	 * @method
	 */
	updateRepeater: function () {
		IntegerPicker.prototype.updateRepeater.apply(this, arguments);

		if (this.width === 0) {
			var ib;
			this.$.repeater.performOnRow(this.$.repeater.rowOffset, function () {
				// have to reset to natural width before getting bounds
				this.$.item.applyStyle('width', 0);
				this.$.measureItem.applyStyle('width', 'auto');
				ib = this.$.measureItem.getBounds();
			}, this);

			this.width = ib.width + this.itemPadding;
			this.applyStyle('width', dom.unit(this.width, 'rem'));
			this.$.repeater.prepareRow(this.valueToIndex(this.value));
			this.$.item.applyStyle('width', dom.unit(this.width, 'rem'));
			this.$.repeater.lockRow(this.valueToIndex(this.value));
		}
		else if (this.width === null) {
			this.$.item.show();
			this.$.measureItem.hide();
		}
	},

	/**
	 * Enables the input field on direct input from the number keys
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.fireSpotKeyDown
	 * @private
	 * @method
	 */
	fireSpotKeyDown: function (sender, ev) {
		var keyCode;
		keyCode = ev.keyCode;
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
	fireSelectEvent: function (sender, ev) {
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
	prepareInputField: function () {
		var index, repeater, item;
		index = this.valueToIndex(this.value);
		repeater = this.$.repeater;
		item = this.$.item;
		if (!item.hasNode() || !item.hasFocus()) {
			this.previousIndex = index;
			repeater.renderRow(index);
			repeater.prepareRow(index);
			this.styleChange();
			item.tempValue = item.value;
			item.setValue(null);
			item.focus();
			Spotlight.freeze();
		}
	},

	/**
	 * Validates the value of input field and sets the value to picker
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.checkInputEnter
	 * @private
	 * @method
	 */
	checkInputEnter: function () {
		var valueInputted, tempValue, item;
		item = this.$.item;
		valueInputted = parseInt(this.$.item.value, 10);
		tempValue = parseInt(item.tempValue, 10);
		if ((valueInputted || valueInputted === 0) && valueInputted <= this.max && valueInputted >= this.min && valueInputted !== tempValue) {
			this.removeStyle();
			this.set('value', parseInt(valueInputted, 10));
			item.blur();
			this.$.repeater.lockRow(this.valueToIndex(this.value));
		} else {
			this.inputBlur();
			this.$.repeater.lockRow(this.valueToIndex(this.value));
		}
		Spotlight.unfreeze();
	},

	/**
	 *  Disables the input field when the focus is lost from the input field
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.inputBlur
	 * @private
	 * @method
	 */
	inputBlur: function (sender, ev) {
		if (this.$.item.hasNode()) {
		var tempValue, item;
		tempValue = this.$.item.tempValue;
		item = this.$.item;
		this.removeStyle();
		item.setValue(tempValue);
		item.blur();
		this.$.repeater.lockRow(this.valueToIndex(this.value));
		}
	},

	/**
	 * Validates the value in the input field when focus is lost by clicking somewhere else
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.onBlur
	 * @private
	 * @method
	 */
	onBlur: function () {
		this.checkInputEnter();
	},

	/**
	 * This is to handle the component resize issues found in Android devices
	 *
	 * @private
	 * @method
	 */
	handleResize: function() {
		return;
	},

	/**
	 *  Changes the styling when input field is enabled
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.styleChange
	 * @private
	 * @method
	 */
	styleChange: function () {
		var item;
		item = this.$.item;
		this.addClass('selectedPicker');
		item.addClass('selectedPickerItem');
		this.$.repeater.addClass('selectedPickerItem');
		this.$.nextOverlay.addClass('arrowColor');
		this.$.previousOverlay.addClass('arrowColor');
	},

	/**
	 *  Removes the styling when input field is disabled
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.removeStyle
	 * @private
	 * @method
	 */
	removeStyle: function () {
		var item;
		item = this.$.item;
		this.removeClass('selectedPicker');
		item.removeClass('selectedPickerItem');
		this.$.repeater.removeClass('selectedPickerItem');
		this.$.nextOverlay.removeClass('arrowColor');
		this.$.previousOverlay.removeClass('arrowColor');
	},

	/**
	 *  Enable the input field by tap on the picker's input area
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.selectByTap
	 * @private
	 * @method
	 */
	selectByTap: function (sender, ev) {
		if (!ev.originator.hasClass('moon-scroll-picker-taparea')) {
			if (Spotlight.getCurrent() != this) {
			  	Spotlight.unfreeze();
				Spotlight.spot(this, {focusType: 'point'});
			}
			this.prepareInputField();
			ev.preventDefault();
		}
	},

	/**
	 * Ignores the 'up' key press when the input field is enabled
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.spotUp
	 * @private
	 * @method
	 */
	spotUp: function () {
		if (this.$.item.hasNode()) {
		this.checkInputEnter();
		}
	},

	/**
	 * Ignores the 'down' key press when the input field is enabled
	 *
	 * @see module:moonstone/IntegerPicker~IntegerPicker.spotDown
	 * @private
	 * @method
	 */
	spotDown: function () {
		if (this.$.item.hasNode()) {
		this.checkInputEnter();
		}
	},

	/**
	 * Forces recalculation of the width of the picker.
	 *
	 * @see module:enyo/UiComponent~UiComponent.reflow
	 * @private
	 * @method
	 */
	reflow: function () {
		this.width = 0;
		IntegerPicker.prototype.reflow.apply(this, arguments);
	},

	// Accessibility

	/**
	 * @private
	 */
	ariaObservers: [{
		path: 'unit',
		method: function () {
			this.set('accessibilityHint', null);
			this.ariaValue();
		}
	}, {
		path: 'spotted',
		method: function () {
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
	ariaValue: function () {
		var text = this.accessibilityValueText ||
			(this.unit ? this.value + ' ' + this.unit : this.value);
		this.setAriaAttribute('aria-valuetext', text);
	}
});
