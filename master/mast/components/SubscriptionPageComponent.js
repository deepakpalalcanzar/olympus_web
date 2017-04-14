Mast.registerComponent('SubscriptionPage', {

	template: '.subscription-page-template',
	outlet  : '#content',
	regions: {
		'.subscription-table-region'  : 'SubscriptionTable'
	},

});