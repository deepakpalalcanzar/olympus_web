Mast.registerComponent('EnterprisesPagesMenu', {

	template: '.enterprises-pages-template',
	outlet  : '#content',
	regions: {
		'.workgroup-table-region'  : 'UserWorkgroup'
	},

	events: {
		'click': 'showUserInfo',
	},
	
});