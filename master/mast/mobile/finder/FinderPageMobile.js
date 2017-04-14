Mast.registerComponent('FinderPageMobile', {
	
	extendsFrom: 'PageMobile',

	regions: {

		// Main UI region for visualizing the filesystem
		'.main-ui-region': 'DirectoryMobile',

		// Top navigation bar
		'.topbar-region': {

			extendsFrom: 'TopbarMobile',
			model: {
				pageTitle: 'Overview',
				action: null
			}
		}
	}
});