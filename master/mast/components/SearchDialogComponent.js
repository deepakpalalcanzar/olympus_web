Mast.registerComponent('SearchDialogComponent', {

	extendsFrom : 'DialogComponent',
	// collection 	: Mast.Collection.extend({url: '/directory'}),
	template 	: '.search-dialog-template',
	outlet 		: '#content',
	events : {
		'click .upload-button' : 'getSelectedWorkgroup'
	},

	model: '',

	afterRender: function(){
		var self = this;
// Call inherited afterRender.
		Mast.components.DialogComponent.prototype.afterRender.call(this);
// If the folder is collapsed, expand it.
		if (!Olympus.isPrivateDeployment) {
    		self.$('input.workgroups').autocomplete({
    			source: self.searchWorkgroups,
    			autoFocus: true,
    			appendTo: self.$('.workgroup-list'),
				select: function( event, ui ) {
					ui.item.workgroup.permission_type = $('select[name="permission_type"]').val();
					self.model.set({
						'workgroup_data': ui.item.workgroup
					},{silent:true});
    			}
    		});
        }
	},


	searchWorkgroups: function(req, callback) {
		var searchTerm = req.term;
		Mast.Socket.request('/directory/fetchAssignWorkgroup',{
			name	: searchTerm,
			isPrivateDeployment: true
		}, function(res) {
			if (res.status === 403) {
				return;
			}
			workgroups = _.map(res, function(value) {
				return {
					label: value.name,
					workgroup: value
				};
			});
			callback(workgroups);
		});
	},

	getSelectedWorkgroup: function(){
		var self= this;
		if($.isEmptyObject(this.model.attributes) === false){
			self.addPermissionViaEmail();
		}else{
			this.model.unset("workgroup_data", { silent: true });
		}
	},

	addPermissionViaEmail: function () {

// If there is no input, then do nothing. useful for pressEnter event
		if (this.$('input[name="permission_type"]').val() === '') {
			return;
		}

		var self = this;
// Get the contents of the "Share with someone else" input
		var role = this.$('select[name="permission_type"]').val();
		var workgroup 		= this.model.attributes.workgroup_data.id;
		var emails	  		= Mast.Session.User.email;

		var url;
		if(Mast.Session.Account.isSuperAdmin === 1){
			url = '/tempaccount/assignPermission';
		}else{
			url = '/directory/assignPermission';
		}
		
		console.log(url);

// Send a request to add permission for this user, who may or may not exist.
// If they don't exist, they'll be added
		console.log('***in component**');
		Mast.Socket.request( url ,{
			id: workgroup,
			email: emails,
			permission: 'write',
			type: 'permission'
		}, function(err, res){
			console.log('error');
			console.log(err);
			console.log('success');
			console.log(res);
			self.closeDialog();
		});
	},

	bindings: {
// Displayed/hides the ajax spinner if user is uploading or finished uploading file.
		uploading: function(newVal) {
			if (newVal) {
// Since we have the progress bar, we'll close the dialog as soon as we start the upload
				this.closeDialog();
			}
		}
	}

});
