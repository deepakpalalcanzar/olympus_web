Mast.TooltipGenerator = Mast.Component.extend({

	template: '#tooltipGenerator-template',
	outlet	: '#content',

	events: {
		'mouseover input'	: 'showTooltip',
		'mouseout input'	: 'hideToolTip'

	},

	// create annonymous tooltip component on mouseover of the tooltipGenerator
	showTooltip: function() {

		this.tooltip = new Mast.Component({
			model: {
				tooltipString: 'tooltip',
				dummy: ''
			},

			template 	: "#tooltip-template", 
			outlet		: "#tooltip-outlet",

			fadeIn: function() {
				this.set('dummy', 'fade in', {
					render: function($current) {
						$current.delay(500).fadeIn(100, function(){
						});
					}
				});
			}
		});
		this.tooltip.fadeIn();
	},

	// remove annonymour tooltip component from the TooltipGenerator view
	hideToolTip: function() {
		this.tooltip.$el.fadeOut(100, function() {
			$(this).remove();
		});
	}
});