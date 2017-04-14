Mast.registerTree('AdminUserDetailsTable', {

	extendsFrom: 'UITableComponent',
	model: {
		column1: {
			name: 'Name',
			className: 'admin-user-details-name'
		},
		column2: {
			name: 'Email',
			className: 'admin-user-details-email'
		},
		selectedModel: null
	},

	template: '.admin-user-details-template',
// branch properties
	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'AdminUserDetailsRow',
	branchOutlet   : '.admin-user-details-outlet',
	collection     : 'AdminUserDetails' ,

	init: function(){
		var self = this;
		var profileId =  { id : Mast.Session.adminUser.id };
		this.collection.reset();
		this.collection.fetchAdminUserDetails(profileId,function(res, err){

		});
	},

});

// user row component
Mast.registerComponent('AdminUserDetailsRow', {
	template: '.admin-user-details-row-template',

	events: {
		'click': 'navigateToUser',
	},

	navigateToUser: function() {
		Mast.Session.User = this.model.attributes;
		Mast.navigate('user/details');
	},
});