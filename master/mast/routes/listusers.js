Mast.routes['listusers/:page'] = function(query,page) {
// Empty container
	$("#content").empty();
        Mast.Session.page = Mast.history.getFragment(query, page);
	var listusersPage = new Mast.components.ListUsersPage();
};
