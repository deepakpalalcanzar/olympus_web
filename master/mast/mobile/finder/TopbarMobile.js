// TopBar.m
Mast.registerComponent('TopbarMobile', {

	model: {
		pageTitle: 'Overview'
	},

	// the defualt template for the topbar component. This will often get overridden when attaching 
	// this component to a region.
	template: '.topbar-mobile-template',

	regions: {
		'.nav-region': 'NavMobile'
	},

	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$('.nav-region'));
		OlympusHelper.touchEnhance(this.$('.add-permission-box'));
		OlympusHelper.touchEnhance(this.$('.add-comment-box'));
		OlympusHelper.touchEnhance(this.$('.add-permission'));
		OlympusHelper.touchEnhance(this.$('.submit-comment')); 

		// disable scroll touch on header and future box
		this.$('h1, .future-box').bind('touchstart', function(e) {
			e.preventDefault();
		});
	}


});