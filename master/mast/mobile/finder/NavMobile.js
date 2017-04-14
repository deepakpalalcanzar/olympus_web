Mast.registerComponent('NavMobile', {

	model: {
		active: false
	},

	template: '.nav-mobile-template',

	bindings: {
		
		active: function(newVal) {
			(newVal) ? this.displayNav() : this.hideNav();
		}
	},

	events: {
		'touch': '@active!'

	},

	// Enhance touch interface
	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$el);
	},

	displayNav: function() {

		// attach a veil component
		this.attach('.veil-region', 'VeilMobile');
		this.attach('.nav-dropdown-region', 'NavDropdownMobile');
	},

	hideNav: function() {

		// detach the veil component
		this.detach('.veil-region');
		this.detach('.nav-dropdown-region');
		this.$el.removeClass('tapped');
	}
});