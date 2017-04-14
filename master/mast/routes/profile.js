Mast.routes.profile = function(query,page) {
// Empty container
	$("#content").empty();
	new Mast.components.ProfilePage();
};

Mast.routes['profile'] = function(query, page) {
	$("#content").empty();
	var profile = new Mast.components.ProfilePage();
};

Mast.routes.addProfile = function(query,page) {
// Empty container
	$("#content").empty();
	new Mast.components.AddProfileComponent();
};

Mast.routes['profile/updateprofile'] = function(query, page) {
	$("#content").empty();
	var update = new Mast.components.UpdateProfileComponent();
};