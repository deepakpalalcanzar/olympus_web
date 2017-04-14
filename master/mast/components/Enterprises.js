Mast.registerTree('EnterprisesTable', {

	extendsFrom: 'UITableComponent',

	model: {
		column1: {
			name: 'Enterprises',
			className: 'enterprises-column'
		},
		column2: {
			name: 'Users',
			className: 'users-column'
		},
		column4: {
			name: 'Action',
			className: 'action-ent-column'
		},
		column5: {
			name: 'Impersonate',
			className: 'impersonate-column'
		},
		column6: {
			name: 'Owner',
			className: 'owner-column'
		},
		column7: {
			name: 'Subscription',
			className: 'subscription-column'
		},
		selectedModel: null
	},
	
	template: '.enterprises-template',

// branch properties
	emptyHTML      : '<div class="loading-spinner"></div>',
	branchComponent: 'EnterprisesRow',
	branchOutlet   : '.enterprises-outlet',

	collection     : {
		url: '/enterprises/listEnterprises',
		model: Mast.Model.extend({
			defaults: {
				highlighted 	: false,
				name        	: "Enterprise Name 1",
				acc_name		: "Abhi",
				features		: "Subscription Plan1",
				users_limit   	: '5',
				workgroup_limit : '6' ,
				is_impersonate 	: 'Deactivated',
				avatarSrc      	: 'images/icon_profilePicture_default@2x.png',
				phone_number    : '7894561230',
				email      		: 'geoff@gtudor.com',
			},
			selectedModel: null
		})
	},

	init:function(collection){
        $('.searchbar').show();
    },

	events: {
		'click .ent-delete': 'deleteEnterprise',
	},

	bindings: {
// set highlight to false except for newly selected user
		selectedModel: function(newModel) {
			this.collection.invoke('set', 'highlighted', false);
			newModel.set({highlighted: true});
		}
	},

	loading: function(newModel) {
		if (newVal) {
			$('.subscription-template .loading-spinner').show();
		} else {
			$('.subscription-template .loading-spinner').hide();
		}

	},
	
	deleteEnterprise: function(e){
		var self = this.collection;
		var id = $(e.currentTarget).data("id");
		var item = this.collection.get(id);
		if(typeof item !== 'undefined'){
			if(confirm('Are you sure ?')){
				
				Mast.Socket.request('/enterprises/deleteEnterprises', { id: id}, function(res, err){
					if(res.error_msg){
						alert(res.error_msg);		
					}else if(res.success){
						alert("User was deleted successfully.");
						self.remove(id);
					}
				});
				
			}
		}
	},
});


// user row component
Mast.registerComponent('EnterprisesRow', {

	template: '.enterprises-row-template',
	bindings: {
		highlighted: function(newVal) {
			if (newVal) {
				this.addHighlight();
			} else {
				this.removeHighlight();
			}
		}
	},

	events: {
		'click .impersonate-column': 'impersonate',
		'click .enterprises-column': 'updateEnterprise',
	},

	impersonate: function(){

		var options = {
			email: this.model.attributes.acc_email,
		}

		Mast.Socket.request('/enterprises/impersonate', options, function(req, err) {
			if(req == 200){
				// window.open('https://dev.olympus.io/', '_blank');
				// window.open('https://localhost/', '_blank');
				// window.open('https://'+sails.config.host+'/', '_blank');
				window.open(window.location.protocol+'//'+window.location.host+'/', '_blank');
				window.focus();
			}		
		});
		
	},

// Selects the user that was clicked on. gives the parent the current users model
	selectUser: function() {
		this.parent.set({selectedModel: this.model});
	},

// Creates an instance of the sidebar with the data of this current users
// model.
	openSidebar: function() {
		this.parent.set({selectedModel: this.model});
		this.parent.parent.trigger('openSidebar', this.model);
	},

// Add highlight to the User row
	addHighlight: function() {
		this.$el.addClass('highlighted');
	},

// Remove highlight from the User row
	removeHighlight: function() {
		this.$el.removeClass('highlighted');
	},

	updateEnterprise: function(){
		Mast.Session.enterprises = this.model.attributes;
		Mast.navigate('#enterprises/updateenterprise');
	},

});




