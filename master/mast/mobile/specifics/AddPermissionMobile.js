Mast.registerComponent('AddPermissionMobile', {
		
	extendsFrom: 'PageMobile',

	regions: {

		'.topbar-region': {

			extendsFrom: 'TopbarMobile',

			template: '.topbar-mobile-template',

			events: {
				'touch .add-permission': 'addPermission'
			},

			// Set the page title and give the action box an add permission action
			beforeCreate: function() {
				this.set(
					{pageTitle: 'Add Permission', action: 'add-permission'},
					{silent: true});
			},

			// This will need to make a call to the current inode /permission which will allow us to know
			// all of the current permissions for this inode. We can then compare the email of the added
			// user and check if they are already have access. If they do not, we will add them as a
			// permission to this inode using /addPermission.
			addPermission: function() {

				var type, url, payload, permissionForm, regEx;

				this.$('.add-permission').removeClass('tapped');

				permissionForm = this.parent.child('.main-ui-region');
				
				// If there is no input, display an alert.
				if (permissionForm.isEmpty()) {
					this.delayedAlert('Please enter an email or user name and try again.');
					return;
				}

				type    = this.parent.get('type');
				url     = '/' + type + '/addPermission';
				payload = permissionForm.getEmailPermissionInfo();

				// Check the email validity.
				if (!permissionForm.isValidEmail(payload.email)) {
					this.delayedAlert('Please enter a valid email try again.');
					return;
				}

				// send server request to with the apyload to add this permission
				Mast.Socket.request(url, payload, function() {
					alert('That new permission has been added.');
					permissionForm.clearEmail();
				});
			},

			// for the part, this works the same as addPermissionUser except that 
			// send addPermission request to server user by email. For someone not a user already.
			addPermissionViaEmail: function () {

				var type, url, payload;

				

				var self = this;

				// Get the contents of the "Share with someone else" input
				var emails = $('input.accounts').val();
				self.$('input.accounts').val('');

				// Check that a user with the specified email doesn't already have permissions
				if (this.collection.getByEmail(emails)) {
					console.log('User with email '+emails+' already has permissions...');
					return;
				}
			},

			// There is a big where the checkbox does not remove its class if there is an alert.
			// I dont know what causes it but giving a slight delay to the alert box is
			// one solution for this bug.
			delayedAlert: function(message) {
				setTimeout(function() {alert(message);}, 100);
			}
		},

		'.main-ui-region': {

			template: '.add-permission-mobile-template',

			events: {
				// 'touch input[name="email"]': 'scrollTop'
			},

			afterCreate: function() {
				OlympusHelper.touchEnhance(this.$('input[name="email"]'));

				var self = this;

				// create new autocomplete for use with the input
				self.$('input').autocomplete({

					// search the accounts in the database for the source results
					source   : self.searchAccounts,

					autoFocus: true,
					appendTo : self.$('.auto-complete')						
				});

			},

			searchAccounts: function(req, callback) {
				var searchTerm = req.term;

				Mast.Socket.request('/account/fetch',{
					email	: searchTerm,
					name	: searchTerm
				}, function(accounts) {
					accounts = _.map(accounts, function(value) {
						return {
							label: value.name+' <'+value.email+'>',
							value: value.email,
							account: value
						};
					});
					callback(accounts);
				});
			},

			// get desired email and permission to and return the object
			getEmailPermissionInfo: function() {
				return {
					id        : this.parent.get('id'),
					type      : 'permission',
					email     : this.$('input[name="email"]').val(),
					permission: this.$('select').val()
				};
			},

			// get the data to send to the server if a user name was entered. 
			getUserPermissionInfo: function() {
				return {
					id        : self.get('id'),
					type      : 'permission',
					owned_by  : ui.item.account,
					permission: this.$('select').val()
				};
			},

			isEmpty: function() {
				return this.$('input[name="email"]').val() === '';
			},

			// this checks there is a valid email and returns cool
			isValidEmail: function(email) {
				var regEx = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return regEx.test(email);
			},

			clearEmail: function() {
				this.$('input[name="email"]').val('');
			}
		}
	}
});