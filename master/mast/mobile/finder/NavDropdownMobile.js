Mast.registerComponent('NavDropdownMobile', {

	template: '.nav-dropdown-mobile-template',

	events: {

		'touch .overview': 'navigateOverview',
		'touch .settings': 'navigateSetting',
		'touch .signout' : 'signOut'
	},

	// we have to put the individual selectors or else all the li will get the tapped class
	// when touched
	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$('li.overview'));
		OlympusHelper.touchEnhance(this.$('li.settings'));
		OlympusHelper.touchEnhance(this.$('li.signout'));
	},

	// navigate to the #finder route
	navigateOverview: function() {
		Mast.navigate('finder');
	},

	// navigate to the #accountSettings route
	navigateSetting: function() {
		Mast.navigate('accountSettings');
	},


	// logout of the application
	signOut: function() {
		window.location.pathname = '/logout';
	}

});