Mast.routes.adminUser = function(query, page) {
// Empty container
	$("#content").empty();
	var adminUser = new Mast.components.AdminUserPage();
};

Mast.routes.addAdminProfile = function(query, page) {
// Empty container
	$("#content").empty();
	var addAdminUser = new Mast.components.AddAdminUserComponent();
};

Mast.routes['adminuser/userdetails'] = function(query, page) {
	$("#content").empty();
	var adminUserDetails = new Mast.components.AdminUserDetailsPage();
	
};