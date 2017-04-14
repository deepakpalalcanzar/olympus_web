Mast.registerTree('UpgradeSubscriptionTable', {

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
		column6: {
			name: 'Quota Limit',
			className: 'quota-column'
		},
		column7: {
			name: 'Buy',
			className: 'is-default-column'
		},
		selectedModel: null
	},
	
	template: '.upgrade-subscription-template',

// branch properties
	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'UpgradeSubscriptionRow',
	branchOutlet   : '.upgrade-subscription-outlet',

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

		var d = new Date();
		var n = new Date(new Date(d).setMonth(d.getMonth()+parseInt('5')));
		console.log(d);
		console.log(n);


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
				Mast.Socket.request('/subscription/deleteSubscription', { id: id}, function(res, err){
					if(res.error_msg){
						alert(res.error_msg);		
					}else if(res.success){
						self.remove(id);
					}
				});
			}
		}
	},

});

// user row component
Mast.registerComponent('UpgradeSubscriptionRow', {
	template: '.upgrade-subscription-row-template',
	events: {
		'click .upgrade-subscription': 'upgrade',
		'click .upgrade-free': 'upgradeFree',
	},

	upgrade: function(event) {
		Mast.Session.subscription = this.model.attributes;
		Mast.navigate('subscription/upgradeform');
	},

	upgradeFree:function(){
		var id = this.model.attributes.id;
		Mast.Socket.request('/subscription/upgradeFree', { id: id}, function(res, err){
			if(res.success){
				alert("Subscription upgraded successfully.");
				Mast.navigate('#account/subscription');
			}else{
				alert("Subscription Can't be upgraded!");
			}
		});
	},

});