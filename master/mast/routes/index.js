Mast.routes.index = function(query, page) {
	// If any of these URLS, do nothing.
	if(window.location.pathname == '/auth/login' || window.location.pathname == '/login' || window.location.pathname == '/auth/verify') {

	} else if(Mast.isMobile) {
		Mast.navigate("#finder");
	} else {
		// Empty container
		$("#content").empty();

		// create user navigation
		Olympus.ui.userNavigation.append();
		// create actionbar
		Olympus.ui.actionBar.append();
		// var breadCrumb = new Mast.components.BreadCrumbTree();
		// Show the filesystem stuff
		Olympus.ui.fileSystem.append();
	}
};

Mast.routes.overview = function(query, page) {
	Mast.navigate('#');
};

Mast.routes.thumbnail = function(query, page) {
	$("#content").empty();
	var thumbnail = new Mast.components.ThumbnailComponent();
};

Mast.routes.trash = function(query, page) {
	$("#content").empty();
	var trash = new Mast.components.TrashFileSystem({ outlet : '#content'});
};