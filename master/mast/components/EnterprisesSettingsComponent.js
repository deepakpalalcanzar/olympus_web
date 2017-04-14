Mast.registerComponent('EnterprisesSettingsComponent',{

	template: 	'.enterprises-settings-template',
	outlet: 	'#content',
	
	events: {
		'click .user-details'       : 'displayUsersDetails',
		'click .back-to-enterprise' : 'backToEnterprises',
		'click .enterpriseWorkgroup': 'displayWorkgroups',
		'click .enterpriseUsers' 	: 'displayUsers'
	},

	backToEnterprises: function() {
		window.location = '#enterprises';
	},

	displayUsers: function() {
		this.attach('.enterprises-settings-page', 'EnterpriseUserList');
		this.set('selectedTab', 'enterpriseUsers');
	},

	displayWorkgroups: function() {
		this.attach('.enterprises-settings-page', 'EnterpriseWorkgroupList');
		this.set('selectedTab', 'enterpriseWorkgroup');
	},

	displayEnterpriseDetails: function(){
		this.attach('.enterprises-settings-page', 'UpdateEnterprise');
		this.set('selectedTab', 'enterprisesDetails');
	},	

});