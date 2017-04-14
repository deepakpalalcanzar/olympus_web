Mast.registerComponent('UserWorkgroupList', {

	template: '.workgroup-page-template',
	outlet  : '#content',
	regions: {
		'.workgroup-table-region'  : 'UserWorkgroup'
	},
	// events: {
	// 	'click .delete-workgroup' : 'deleteWorkgroupPermission'
	// },

	// deleteWorkgroupPermission: function(e){

	// 	var workgroup = $(e.target).data('id');
	//var workgroup_name = $(e.target).data('name');
	// 	console.log(this.collection);

	/*	Mast.Socket.request('/account/deletePermission', { workgroup_id: workgroup, user_id: Mast.Session.User.id, user_name: Mast.Session.User.name,workgroup_name: workgroup_name }, function(res, err){

		});*/
	// },

});