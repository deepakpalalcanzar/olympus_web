Mast.registerComponent('SearchList', {
	template: '.search-page-template',
	outlet  : '#content',
	regions: {
		'.search-table-region'  : 'Search'
	},
});