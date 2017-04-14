// activity tab component
//Mast.components.ActivityDetailsComponent = Mast.Component.extend({
Mast.registerComponent('ActivityComponent',{

	template: '.activity-template',
	outlet	: '.activity-sharing-outlet',


// create new current viewers and inode comments components
	afterRender: function() {

		this.activityList = new Mast.components.ActivityList({
			model: this.pattern.model
		});
	},
	
	show: function(){
		this.$el.show();
	},
	
	hide: function() {
		this.$el.hide();
	},

	afterCreate: function() {
		if (this.get('type') === 'directory') {
			this.attach('.quotas-outlet', 'QuotasComponent');
		}
	}
});
