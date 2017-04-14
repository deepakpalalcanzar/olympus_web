Mast.registerComponent('AdminUserDetailsPage', {

	template: 	'.admin-user-details-page-template',
	outlet: 	'#content',
	regions: {
		'.adminuser-details-table-region'  : 'AdminUserDetailsTable'
	},
	afterConnect: function(){
		console.log(Mast.Session.adminUser);
		this.set(Mast.Session.adminUser);
	},
});