Mast.registerTree('SubscriptionTable', {

	extendsFrom: 'UITableComponent',
	model: {

		column1: {
			name: 'Plan Name',
			className: 'features-column'
		},
		column2: {
			name: 'Price',
			className: 'price-column'
		},
		column3: {
			name: 'Duration',
			className: 'duration-column'
		},
		column4: {
			name: 'Users Limit',
			className: 'sub-users-column'
		},
		column5: {
			name: 'Quota (GB)',
			className: 'quota-column'
		},
		column6: {
			name: 'Default',
			className: 'is-default-column'
		},
		column7: {
			name: 'Action',
			className: 'action-column'
		},
		selectedModel: null
	},
	
	template: '.subscription-template',

// branch properties
	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'SubscriptionRow',
	branchOutlet   : '.subscription-outlet',

	collection     : {
		url: '/subscription/listSubscription',
		model: Mast.Model.extend({
			defaults: {
				highlighted : false,
				features  	: "Subscription1" ,
				price   	: '100' ,
				duration   	: '6M' ,
				users_limit : '5',
				workgroup_limit: '8',
				quota :'5Gb',
				id : null,

			},
			selectedModel: this
		})
	},

	events: {
		'click .action-edit': 'editSubscription',
		'click .action-delete': 'deleteSubscription',
	},

	init:function(collection){
        var self = this.collection;
        this.collection.bind('remove', this.deleteSubscription);
        $('.searchbar').hide();
    },

    deleteSubscription: function(e) {
    	var self = this.collection;
		var id = $(e.currentTarget).data("id");
		var item = this.collection.get(id);
		if(typeof item !== 'undefined'){
			if(confirm('Are you sure you want to delete?')){
				if(confirm('Are you sure you want to delete?')){
					Mast.Socket.request('/subscription/deleteSubscription', { id: id}, function(res, err){
						if(res.error_msg){
							alert(res.error_msg);		
						}else if(res.success){
							self.remove(id);
						}
					});
				}
			}
		}
	},

});

// user row component
Mast.registerComponent('SubscriptionRow', {
	
	template: '.subscription-row-template',
	events: {
		'click .action-edit': 'editSubscription',
	},

	editSubscription: function(event) {
		Mast.Session.subscription = this.model.attributes;
		Mast.navigate('subscription/updatesubscription');
	},

});
