Mast.registerComponent('ProfilePage', {
	template: '.profile-page-template',
	outlet  : '#content',
	regions: {
		'.profile-table-region'  : 'ProfileTable'
	},
});