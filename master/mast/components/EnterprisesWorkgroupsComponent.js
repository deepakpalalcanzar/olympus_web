Mast.registerTree('EnterprisesWorkgroups', {
	
	template: '.enterprises-workgroups-template',

	model: {
		column1: {
			name: 'Workgroups',
			className: 'user-column'
		},
		selectedModel: null
	},

	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'EnterprisesWorkgroupRow',
	branchOutlet   : '.enterprises-workgroup-outlet',
	collection 	   : 'EnterprisesWorkgroup',
	
	init: function(){
		var self = this;
		var userId =  { id : Mast.Session.enterprises.account_id };
		this.collection.enterpriseWorkgroup(userId,function(res, err){
		});
	},
});

// user row component
Mast.registerComponent('EnterprisesWorkgroupRow', {
	template: '.enterprises-workgroup-row-template',
});