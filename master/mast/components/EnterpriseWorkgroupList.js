Mast.registerComponent('EnterpriseWorkgroupList', {
	template: '.enterprise-workgroup-page-template',
	outlet  : '#content',
	regions: {
		'.enterprise-table-region'  : 'EnterprisesWorkgroups'
	},
});