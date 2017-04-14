Mast.registerComponent('VeilMobile', {

	template: '.veil-mobile-template',

	model: {
		visible: false
	},

	events: {
		// 'touch':
	},

	afterCreate: function() {
		OlympusHelper.touchEnhance(this.$el);
	},

	bindings: {
		visible: function(newVal) {

		}
			
	},

	applyVeil: function() {
		console.log('applying');
	},

	removeVeil: function() {
		console.log('removing');
	}

});
