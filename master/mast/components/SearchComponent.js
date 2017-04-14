Mast.registerTree('Search', {
	
	template: '.search-result-template',
	
	model: {
		column1: {
			name: 'Workgroups',
			className: 'user-column'
		},
		column2: {
			name: 'Workgroups',
			className: 'user-column'
		},
		selectedModel: null
	},

	emptyHTML      : '',
	branchComponent: 'SearchUserRow',
	branchOutlet   : '.search-result-outlet',
	collection 	   : 'Searchresult',

	

	init: function(){
		var self = this;
		var searchterm =  { term: Mast.Session.term,from_page: Mast.Session.from_page};
		console.log(searchterm);
		this.collection.searchUsers(searchterm,function(res, err){
		});
	},

});

// user row component
Mast.registerComponent('SearchUserRow', {
	template: '.search-result-row-template',

	events:{
		'click .searchuser-list' : 'navigateUser'
	},

	navigateUser: function(){
		console.log(this.model.attributes);
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