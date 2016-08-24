/**
* Contains the declaration for the {@link module:moonstone/DaySelector~DaySelector} kind.
* @module moonstone/DaySelector
*/

require('moonstone');

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Control = require('enyo/Control'),
	Signals = require('enyo/Signals');

var
	ilib = require('enyo-ilib'),
	DateFmt = require('enyo-ilib/DateFmt'),
	LocaleInfo = require('enyo-ilib/LocaleInfo');

var
	FormCheckbox = require('moonstone/FormCheckbox'),
	$L = require('../i18n');

/**
* Fires when the current selection changes.
*
* @event moonstone/DaySelector~DaySelector#onChange
* @type {Object}
* @property {Object | Object[]} selected - The array of the currently selected items.
* @property {String} content -  The content of the currently selected items' representative values .
* @property {Number | Number[]} index - Index of the currently selected items.
*
* @public
*/

/**
* {@link module:moonstone/DaySelector~DaySelector},  is a day selector menu
*  that solicits day of the week from the user.
*
* Fires an [onChange]{@link module:enyo/DaySelector~DaySelector#onChange} event.
*
* ```
* var DaySelector = require('moonstone/DaySelector');
* ...
* {kind: DaySelector}
* ```
*
* When the user selects every weekday, subtext will be changed 'Every Weekday' automatically.
*
* The content of representative value can be changed.
* ```
* {kind: DaySelector, everyWeekdayText:'Weekdays', everyWeekendText:'Weekends', everyDayText:'Daily'}
* ```
*
* @class DaySelector
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone/DaySelector~DaySelector.prototype */ {

	/**
	* @private
	*/
	name: 'moon.DaySelector',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-day-selector',

	/**
	* @private
	* @lends module:moonstone/DaySelector~DaySelector.prototype
	*/
	published: {

		/**
		* Text to be displayed when all of the day are selected.
		*
		* @type {String}
		* @default 'Every Day'
		* @public
		*/
		everyDayText: $L('Every Day'),

		/**
		* Text to be displayed when all of the weekday are selected.
		*
		* @type {String}
		* @default 'Every Weekday'
		* @public
		*/
		everyWeekdayText: $L('Every Weekday'),

		/**
		* Text to be displayed when all of the weekend are selected.
		*
		* @type {String}
		* @default 'Both Weekend Days'
		* @public
		*/
		everyWeekendText: $L('Every Weekend'),

		/**
		* Text to be displayed as the current value if no item is currently selected.
		*
		* @type {String}
		* @default 'No days selected'
		* @public
		*/
		noneText: $L('Nothing selected'),

		/**
		* Day text type to be displayed in the component.
		* If `true` short text will be displayed for the the days (Sun,Mon..)
		* if `false`, long text will be displayed (Sunday,Monday..)
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		shortDayText: true,

		/**
		* Array of currently selected items, or an empty array if
		* nothing is selected.
		*
		* @type {Object[]}
		* @default null
		* @public
		*/
		selected: null,

		/**
		* Array of the selected items' index values, or an empty array if
		* nothing is selected.
		*
		* @type {Number[]}
		* @default null
		* @public
		*/
		selectedIndex: null
	},

	/**
	* @private
	*/
	firstDayOfWeek: 0,


	events: {
		/**
		* {@link module:moonstone/DaySelector~DaySelector#onChange}
		*/
		onChange: ''
	},
	/**
	* @private
	*/
	handlers: {
		ontap: 'tap'
	},

	/**
	* @private
	*/
	tools: [
		{kind: Signals, onlocalechange: 'handleLocaleChangeEvent'}
	],

	/**
	* @private
	*/
	daysComponents: null,

	/**
	* @private
	*/
	days: null,

	/**
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			// super initialization
			sup.apply(this, arguments);
			this.createChrome(this.tools);
			this.initILib();
			this.selected = (this.selected && this.selected instanceof Array) ? this.selected : [];
			this.selectedIndex = (this.selectedIndex && this.selectedIndex instanceof Array) ? this.selectedIndex : [];
			this.createComponents(this.daysComponents);
			this.selectedIndexChanged();
		};
	}),

	/**
	* @private
	*/
	initILib: function () {
		this.info = getIlibWeekInfo(this.shortDayText ? 'long' : 'full');
		this.daysComponents = this.info.days.map(function (day) {
			return {kind: FormCheckbox, content: day, classes: 'moon-day-selector-control'};
		});
	},

	/**
	* @private
	*/
	handleLocaleChangeEvent: function () {
		this.destroyClientControls();
		this.initILib();
		this.createComponents(this.daysComponents);
		this.render();
	},

	/**
	* @private
	*/
	tap: function (sender, ev) {
		sender.addRemoveClass('checked', sender.checked);

		if (sender.checked && this.selected.indexOf(sender) < 0 ) {
			this.selected.push(sender);
		} else if (this.selected.indexOf(sender) >= 0) {
			this.selected.splice(this.selected.indexOf(sender), 1);
		}
		this.notifyObservers('selected');
	},

	/**
	* @method
	* @private
	*/
	rebuildSelectedIndices: function (selected, controls) {
		this.selectedIndex = [];
		for (var i = 0; i < controls.length; i++) {
			if (selected.indexOf(controls[i]) >= 0) {
				this.selectedIndex.push(i);
			}
		}
		this.selectedIndex.sort();
	},

	/**
	* Fires an `onChange` event.
	*
	* @fires module:moonstone/DaySelector~DaySelector#onChange
	* @private
	*/
	fireChangeEvent: function () {
		var contentStr = formatDayString(this.selectedIndex, {
			everyDayText: this.everyDayText,
			everyWeekendText: this.everyWeekendText,
			everyWeekdayText: this.everyWeekdayText,
			noneText: this.noneText,
			info: this.info
		});

		if (this.generated) {
			this.doChange({
				selected: this.get('selected'),
				content: contentStr,
				index: this.get('selectedIndex')
			});
		}
	},

	/**
	* @private
	*/
	selectedChanged: function (inOldValue) {
		var selected = this.get('selected'),
		controls = this.getClientControls();
		this.rebuildSelectedIndices(selected, controls);
		this.fireChangeEvent();
	},

	/**
	* @private
	*/
	selectedIndexChanged: function () {
		var controls = this.getClientControls(),
			index = this.get('selectedIndex'),
			checked;
		for (var i = 0; i < controls.length; i++) {
			checked = index.indexOf(i) >= 0;
			if (checked) {
				controls[i].set('checked', checked);
				this.selected.push(controls[i]);
				controls[i].addRemoveClass('checked', checked);
			}
		}
		this.notifyObservers('selected');
	}
});

/**
 * Returns information about the configuration for a week for the current locale.
 *
 * @param  {String} length ilib DatFmt length ('short', 'long', 'full')
 *
 * @return {Object}        Week information object
 */
function getIlibWeekInfo (length) {
	var i, index, info,
		df = new DateFmt({length: length}),
		li = new LocaleInfo(ilib.getLocale());

	info = {
		days: [],
		daysOfWeek: df.getDaysOfWeek(),
		firstDayOfWeek: li.getFirstDayOfWeek(),
		weekendStart: li.getWeekEndStart ? li.getWeekEndStart() : 6,
		weekendEnd: li.getWeekEndEnd ? li.getWeekEndEnd() : 0
	};

	for (i = 0; i < info.daysOfWeek.length; i++) {
		index = (i + info.firstDayOfWeek) % 7;
		info.days[i] = info.daysOfWeek[index];
	}

	return info;
}

/**
 * Given an array of indices representing days of the week, returns a formatted string of either a
 * comma-separated list of the names of the days or alternative strings for common combinations.
 *
 * @param {Number[]} days                  Array of day indicies
 * @param {String} [opts.everyDayText]     Alternate text when every day is provided
 * @param {String} [opts.everyWeekdayText] Alternate text week every weekday is provided
 * @param {String} [opts.everyWeekendText] Alternate text when every weekend day is provided
 * @param {String} [opts.noneText]         Alternate text when no days are provided
 * @param {String} [opts.format]           ilib DataFmt length. Not used if `opts.info` provided
 * @param {Object} [opts.info]             Week configuration information including names of
 *	`daysOfWeek`, the `firstDayOfWeek` index, the `weekendStart` index, the `weekendEnd` index, and
 *	the names of the `days` ordered by the `firstDayOfWeek`.
 *
 * @return {String}                        Formatted string for provided days
 */
function formatDayString (days, opts) {
	var bWeekEndStart = false,
		bWeekEndEnd = false,
		length = days.length,
		i, index, info, str, weekendLength;

	opts = utils.mixin({
		everyDayText: $L('Every Day'),
		everyWeekdayText: $L('Every Weekday'),
		everyWeekendText: $L('Every Weekend'),
		noneText: $L('Nothing selected'),
		format: 'long',
		info: null
	}, opts);

	if (length == 7) {
		return opts.everyDayText;
	} else if (length === 0) {
		return opts.noneText;
	} else {
		info = opts.info || getIlibWeekInfo(opts.format);
		weekendLength = info.weekendStart === info.weekendEnd ? 1 : 2;

		for (i = 0; i < 7; i++) {
			// convert the control index to day index
			index = (days[i] + info.firstDayOfWeek) % 7;
			bWeekEndStart = bWeekEndStart || info.weekendStart == index;
			bWeekEndEnd = bWeekEndEnd || info.weekendEnd == index;
		}

		if (bWeekEndStart && bWeekEndEnd && length == weekendLength) {
			return opts.everyWeekendText;
		} else if (!bWeekEndStart && !bWeekEndEnd && length == 7 - weekendLength) {
			return opts.everyWeekdayText;
		} else {
			str = '';
			for (i = 0; i < length; i++) {
				if (str) {
					str += ', ';
				}
				str += info.days[days[i]];
			}
			return str;
		}
	}
}

module.exports.getIlibWeekInfo = getIlibWeekInfo;
module.exports.formatDayString = formatDayString;
