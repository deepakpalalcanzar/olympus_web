Mast.registerTree('AdminUserTable', {

	extendsFrom: 'UITableComponent',
	model: {
		column1: {
			name: 'Profile Name',
			className: 'Profile-column'
		},
		column2: {
			name: 'Number Of Users',
			className: 'no-users-column'
		},
		selectedModel: null
	},

	template: '.admin-user-template',
// branch properties
	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'AdminUserRow',
	branchOutlet   : '.admin-user-outlet',
	collection     : {
		url: '/adminuser/list',
		model: Mast.Model.extend({
			defaults: {
				highlighted 	: false,
				name 			: "Super Admin",
				usercount 		: '10'
			},
			selectedModel: null
		}),
	},

	init: function(){
		var self = this;
		this.set('dat', 'before');
		$('.searchbar').hide();
	},

});

// user row component
Mast.registerComponent('AdminUserRow', {
	template: '.admin-user-row-template',

	events: {
		'click' : 'displayUsersList'
	},

	displayUsersList: function(event) {
		Mast.Session.adminUser = this.model.attributes;
		Mast.navigate('adminuser/userdetails');
	},
});