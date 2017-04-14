Mast.registerComponent('UserSettingsComponent',{

	model: {
		selectedTab: 'userDetails'
	},
	
	template: 	'.user-settings-template',
	outlet: 	'#content',
	events: {
		'click a.account-details'      : 'displayAccountDetails',
		'click a.account-password'     : 'displayAccountPassword',
		'click a.account-notifications': 'displayAccountNotifications'
	},


	bindings: {
// set the selected tab arrow to this el.
		selectedTab: function(newVal) {
			this.removeSelected();
			if (newVal === 'userDetails') {
				this.$('li.userDetails').addClass('selected');
			} else if (newVal === 'userPassword') {
				this.$('li.userPassword').addClass('selected');
			} else if (newVal === 'accountNotifications') {
				this.$('li.accountNotifications').addClass('selected');
			}
		}
	},

// attach account details component to the account settings page region
	displayUserDetails: function() {
		this.attach('.user-settings-page', 'UserDetail');
		this.set('selectedTab', 'userDetails');
	},

// attach user password component to the account settings page region
	displayUserPassword: function() {
		this.attach('.user-settings-page', 'UpdatePassword');
		this.set('selectedTab', 'userPassword');
	},

	displayUserWorkgroup: function() {
		this.attach('.user-settings-page', 'UserWorkgroupList');
		this.set('selectedTab', 'listWorkgroup');
		// this.set('selectedUserData', Mast.Session.User);
	},

// remove all selected classes from the list elemets.
	removeSelected: function($el) {
		this.$('li').removeClass('selected');
	}
});