Mast.registerTree('EnterprisesUsers', {
	
	template: '.enterprises-user-template',
	
	model: {
		column1: {
			name: 'Workgroups',
			className: 'user-column'
		},
		selectedModel: null
	},

	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'EnterprisesUserRow',
	branchOutlet   : '.enterprises-user-outlet',
	collection 	   : 'EnterprisesUser',
	
	init: function(){
		var self = this;
		var userId =  { id : Mast.Session.enterprises.account_id };
		this.collection.enterpriseWorkgroup(userId,function(res, err){
		});
	},
});

// user row component
Mast.registerComponent('EnterprisesUserRow', {
	template: '.enterprises-user-row-template',

	events: {
		'click': 'navigateToUser',
	},

	navigateToUser: function() {
		Mast.Session.User = this.model.attributes;
		Mast.navigate('user/details');
	},
});