// sharing tab component
Mast.registerComponent('SharingComponent',{
	
	template: '.sharing-template',
	outlet	: '.activity-sharing-outlet',

	// create new current viewers and inode comments components
	afterRender: function() {
		this.permissionList = new Mast.components.PermissionList({
			model: this.pattern.model
		});
	},

	show: function(){
		this.$el.show();
	},

	hide: function() {
		this.$el.hide();
	}
});

// row component for the sharing details table component
Mast.registerComponent('PermissionRow',{
	template: '.permissionRow-template',
	events: {
		'click .permission-edit'   : 'showPermissionDropdown',
		'click .remove-shared-user': 'removeSharedUser'
	},

	showPermissionDropdown: function(e) {
		Olympus.util.dropdownHelper.showDropdownAt(this.$(".permission-edit"),-75,15,e,this,this.get('permissionItems'));
	},

	canView		: function () {
		this.set('permission','Can view');
		this.url = ((this.parent.get('type') =='directory') ?					// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") + "/updatePermission";

		Mast.Socket.request(this.url,											// Ask the server for current viewers
		{
			id			: this.parent.get('id'),		// inode id
			permission	: 'read',
			AccountId	: this.get('owned_by').id	// account id
		});
	},

	canComment	: function () {
		this.set('permission','Can comment');
		this.url = ((this.parent.get('type') =='directory') ?					// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") + "/updatePermission";

		Mast.Socket.request(this.url,											// Ask the server for current viewers
		{
			id			: this.parent.get('id'),		// inode id
			permission	: 'comment',
			AccountId	: this.get('owned_by').id	// account id
		});
	},

	canEdit		: function () {
		this.set('permission','Can edit');
		this.url = ((this.parent.get('type') =='directory') ?					// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") + "/updatePermission";

		Mast.Socket.request(this.url,											// Ask the server for current viewers
		{
			id			: this.parent.get('id'),		// inode id
			permission	: 'write',
			AccountId	: this.get('owned_by').id	// account id
		});
	},
	
	isAdmin		: function () {
		this.set('permission','Is admin');
		this.url = ((this.parent.get('type') =='directory') ?					// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") + "/updatePermission";

		Mast.Socket.request(this.url,											// Ask the server for current viewers
		{
			id			: this.parent.get('id'),		// inode id
			permission	: 'admin',
			AccountId	: this.get('owned_by').id	// account id
		});
	},

	removeSharedUser: function(e) {
		this.url = ((this.parent.get('type') =='directory') ?					// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") + "/removePermission";
		Mast.Socket.request(this.url,											// Ask the server for current viewers
		{
			id			: this.parent.get('id'),		// inode id
			AccountId	: this.get('owned_by').id	// account id
		});

		e.stopPropagation();
	}

});

// table for sharing details
Mast.registerTree('PermissionList',{

	template       : '.permission-template',
	outlet         : '.permission-outlet',
	emptyHTML      : '',
	branchComponent: 'PermissionRow',
	branchOutlet   : '.permissionRow-outlet',
	collection     : 'AccountPermissions',

	events: {
		'click .addSharedUser-button': 'addPermissionViaEmail',
		'pressEnter'                 : 'addPermissionViaEmail'
	},

	subscriptions: {
		'~COLLAB_ADD_COLLABORATOR': function(event) {
			console.log("COLLAB_ADD_COLLABORATOR");
			if (event.source.id == this.model.id && !this.collection.getByEmail(event.source.owned_by.email)) {
				this.collection.add(this.collection.marshal([{
					owned_by: {
						name	: event.source.owned_by.name,
						avatar: event.source.owned_by.avatar,
						email: event.source.owned_by.email,
						id: event.source.owned_by.id
					},

					permission: event.source.permission,

					editable: (this.ownerPermission == "Is admin")

				}]));
			}
		},
		'~COLLAB_UPDATE_COLLABORATOR': function(event) {
			var self = this;
			if (event.source.id == this.model.id && this.collection.get(event.source.owned_by.id)) {
				var ownerModel = this.collection.get(event.source.owned_by.id);

				// Use "marshal" to get the human-friendly name for the permission, which we'll
				// use to set the account permission row model
				var marshaledData = this.collection.model.prototype.marshal(event.source);

				ownerModel.set({
					permission: marshaledData.permission
				});

				// If the updated permission was for the logged-in user, then update the
				// editable state of the permission rows based on the new permission.  The
				// permissions for a row can be changed if the row is not for the logged-in user,
				// and the user has admin permissions on the node
				if (event.source.owned_by.id == Mast.Session.Account.id) {
					this.ownerPermission = event.source.permission;
					_.each(this.collection.models, function(model){
						model.set('editable',(self.ownerPermission == 'Is admin' && model.id != Mast.Session.Account.id));
					});
					Olympus.ui.detailsSidebar.updatePublicLinkOptions();
				}
				//this.collection.reset(this.collection.models);
			}
		},
		'~COLLAB_REMOVE_COLLABORATOR': function(event) {
			if (event.source.id == this.model.id && this.collection.get(event.source.owned_by.id)) {
				this.collection.remove(event.source.owned_by.id);
			}
		}
	},

	init: function() {
		
		var self = this;
		this.collection.load(this.pattern.model.attributes, function(){
			_.each(self.collection.models, function(model){
				console.log(model);
				if (model.get('id') == Mast.Session.Account.id) {
					self.ownerPermission = model.get('permission');
				}
			});
		});
	},

	ownerPermission: null,

	afterRender: function() {
		var self = this;

		// Create new autocomplete for use with the textarea. Do this only if this olympus app
		// is not a private deployment.
      //   if (!Olympus.isPrivateDeployment) {
    		// self.$('input.accounts').autocomplete({
    		// 	source: self.searchAccounts,
    		// 	autoFocus: true,
    		// 	appendTo: self.$('.permission-form'),

    		// 	// item in autocomplete dropdown is selected
    		// 	select: self.addPermission
    		// });
      //   }

		// This code seems to be called twice, so we'll do an unbind to make sure that
		// we don't bind the click event to the button more than once
		$('.addSharedUser-button').unbind('click');

	},

	afterCreate: function() {
		// this.$el.disableSelection();
	},

	searchAccounts: function(req, callback) {
		var searchTerm = req.term;

		Mast.Socket.request('/account/fetch',{
			email	: searchTerm,
			name	: searchTerm,
			// isPrivateDeployment: Olympus.isPrivateDeployment
			isPrivateDeployment: true
		}, function(res) {
			if (res.status === 403) {
				return;
			}

			accounts = _.map(res, function(value) {
				return {
					label: value.name+' <'+value.email+'>',
					value: value.email,
					account: value
				};
			});
			callback(accounts);
		});
	},

	// send addPermission request to server
	addPermission: function (e,ui) {

// Check that the selected person isn't already in the list
		if (this.collection.get(ui.item.account)) {
			console.log('User with email '+ui.item.account.email+' already has permissions...');
			return;
		}
		var self = this;

// Clear text area to avoid submitting this twice
		self.$('input.accounts').val("");

		// Add permission on server
		Mast.Socket.request('/'+self.get('type')+'/addPermission',{
			id: self.get('id'),
			owned_by: ui.item.account,
			permission: 'comment',
			type: 'permission'
		});
		e.preventDefault();
	},

	// send addPermission request to server user by email
	addPermissionViaEmail: function (e) {

// If there is no input, then do nothing. useful for pressEnter event

		if (this.$('input.accounts').val() === '') {
			return;
		}

		var self = this;
// Get the contents of the "Share with someone else" input
		var emails = $('input.accounts').val();
		self.$('input.accounts').val('');

// Check that a user with the specified email doesn't already have permissions
		if (this.collection.getByEmail(emails)) {
			console.log('User with email '+emails+' already has permissions...');
			return;
		}


		var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/* TODO -- use code below to support sharing with multiple emails at once */
/*
		var errors = false;
		_.each(emails.split(','),function(email){
			if (re.test(email) === false) {
				errors = true;
			}
		});
		if (errors) {
			alert('One or more of the email addresses you entered were invalid; please check and try again.');
		}-
*/
		if (re.test(emails) === false) {
			// alert('The email address you entered was invalid; please check and try again.');
		}
		// Send a request to add permission for this user, who may or may not exist.
		// If they don't exist, they'll be added
		else {
			
			// console.log("WORKED!",emails);
			// console.log(self.get('type'));

			Mast.Socket.request('/'+self.get('type')+'/addPermission',{
				id: self.get('id'),
				email: emails,
				permission: 'comment',
				type: 'permission'
			}, function( res ){
				alert(" An email has been sent to '" + emails + "' inviting them to view this item.");
			});
		}
		e.preventDefault();
	}
});


