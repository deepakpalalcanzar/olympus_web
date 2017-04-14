// AppComponent
Mast.registerComponent('App', {

	template: '.app-template',

	outlet: 'body',

	subscriptions: {
		'#'				: 'finder',
		'#settings'		: 'settings',
		'#account'		: 'account'
	},

	finder: function() {
		this.attach('.page-region', 'Finder');
	},

	settings: function(id) {
		this.attach('.page-region', 'Settings');
	},

	accountSettings: function() {
		this.attach('.page-region', 'AccountSettings');
	}

});