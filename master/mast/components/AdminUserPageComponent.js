Mast.registerComponent('AdminUserPage', {

	template: 	'.admin-page-template',
	outlet: 	'#content',
	regions: {
		'.adminuser-table-region'  : 'AdminUserTable'
	},

	// events: {
	// 	'click .listusers-column' : 'displayUsersList'
	// },

	// displayUsersList: function(event) {
	// 	console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
	// 	console.log(this.model);
	// },

});