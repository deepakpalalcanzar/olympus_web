Mast.registerTree('Searchdate', {
	
	template: '.searchdate-result-template',
	model: {
		column1: {
			name: 'User Name',
			className: 'log-user-column'
		},
		column2: {
			name: 'Activity',
			className: 'log-activity-column'
		},
		column3: {
			name: 'ClientIp',
			className: 'log-clientip-column'
		},
		column4: {
			name: 'Date',
			className: 'log-date-column'
		},
		column5: {
			name: 'Platform',
			className: 'log-platform-column'
		},
		selectedModel: null
	},
	

	emptyHTML      : '',
	branchComponent: 'SearchDateRow',
	branchOutlet   : '.searchdate-result-outlet',
	collection 	   : 'Searchdateresult',

	init: function(){

		var self = this;
		var searchterm =  { from: Mast.Session.from,to: Mast.Session.to,activity: Mast.Session.activity,from_page: Mast.Session.from_page};
		this.collection.searchdateUsers(searchterm,function(res, err){
			console.log(res);
		});
	},

});

// user row component

Mast.registerComponent('SearchDateRow', {

	template: '.searchdate-result-row-template',
	events:{
		'click .searchuser-list' : 'navigateUser'
	},

	navigateUser: function(){

		if(this.model.attributes.is_enterprise === 0){
			Mast.Session.User = this.model.attributes;
			Mast.navigate('user/details');
		}

		if(this.model.attributes.is_enterprise === 1){
			Mast.Session.enterprises = this.model.attributes;
			Mast.navigate('enterprises/updateenterprise');
		}

	}

});
