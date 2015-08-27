var
	kind = require('enyo/kind');

var
	BodyText = require('moonstone/BodyText'),
	Button = require('moonstone/Button'),
	ContextualPopup = require('moonstone/ContextualPopup'),
	ContextualPopupButton = require('moonstone/ContextualPopupButton'),
	ContextualPopupDecorator = require('moonstone/ContextualPopupDecorator'),
	Divider = require('moonstone/Divider'),
	Drawers = require('moonstone/Drawers'),
	FormCheckbox = require('moonstone/FormCheckbox'),
	ImageItem = require('moonstone/ImageItem'),
	Img = require('moonstone/Image'),
	LabeledTextItem = require('moonstone/LabeledTextItem'),
	Panels = require('./Panels'),
	ProgressBar = require('moonstone/ProgressBar'),
	SelectableItem = require('moonstone/SelectableItem'),
	Spinner = require('moonstone/Spinner'),
	ToggleButton = require('moonstone/ToggleButton'),
	ToggleItem = require('moonstone/ToggleItem'),
	Tooltip = require('moonstone/Tooltip'),
	TooltipDecorator = require('moonstone/TooltipDecorator');

var ContainerInitializer = kind({
	components: [
		{kind: Drawers, drawers: [{}], components: [
			{kind: Panels, pattern: 'activity', components: [
				{components: [
					{kind: TooltipDecorator, components: [{kind: Button},{kind: Tooltip}]},
					{kind: ToggleButton},
					{kind: ToggleItem},
					{kind: FormCheckbox},
					{kind: Img},
					{kind: SelectableItem},
					{kind: ProgressBar},
					{kind: Spinner},
					{kind: BodyText},
					{kind: LabeledTextItem},
					{kind: ImageItem},
					{kind: Divider},
					{kind: ContextualPopupDecorator, components: [
						{kind: ContextualPopupButton},
						{kind: ContextualPopup, components: [{}]}
					]}
				]}
			]}
		]}
	]
});

module.exports = function initContainer () {
	var initializer = new ContainerInitializer();
	initializer.renderInto(document.body, true);
	initializer.destroy();
};
