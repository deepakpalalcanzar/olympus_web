Mast.registerComponent('ActionBarMobile', {

	model: Mast.Model.extend({
		defaults: {
			name: ''
		},
		urlRoot: '/directory'
	}),

	template: '.action-bar-mobile-template',

	bindings: {
		name: 'h2'
	},

	naiveRender:false,

	events: {
		'touch .home-button': 'goToTopLevel'
	},

	subscriptions: {
		'#directory/:id'		: 'fetchDirectoryName'
	},

	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$('.home-button'));
		this.$('h2, .add-folder-button').bind('touchstart', function(e) {
			e.preventDefault();
		});
	},

	fetchDirectoryName: function (id) {
		this.set({id: id});
		this.model.fetch();
	},

	goToTopLevel: function() {
		Mast.navigate('finder');
		this.$('.home-button').removeClass('tapped');
	}

});