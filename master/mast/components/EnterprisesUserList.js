Mast.registerComponent('EnterpriseUserList', {
	template: '.enterprise-user-page-template',
	outlet  : '#content',
	regions: {
		'.enterprise-user-table-region'  : 'EnterprisesUsers'
	},
});