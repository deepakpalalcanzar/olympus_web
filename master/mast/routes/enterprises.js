/*Mast.routes.enterprises = function(query,page) {
// Empty container
	$("#content").empty();
	var enterprisesPage = new Mast.components.EnterprisesPage();
};
*/
Mast.routes['enterprises/:page'] = function(query,page) {
// Empty container
	$("#content").empty();
	var enterprisesPage = new Mast.components.EnterprisesPage();
};

Mast.routes.addEnterprises = function(query,page) {
// Empty container
	$("#content").empty();
	var addEnterprises = new Mast.components.AddEnterprisesComponent();
};

Mast.routes['enterprises/enterprisesusers'] = function(query, page) {
	$("#content").empty();
	var users = new Mast.components.EnterprisesSettingsComponent();
	users.displayUsers();
};

Mast.routes['enterprises/enterprisesworkgroups'] = function(query, page) {
	$("#content").empty();
	var users = new Mast.components.EnterprisesSettingsComponent();
	users.displayWorkgroups();
};

Mast.routes['enterprises/updateenterprise'] = function(query, page) {
	$("#content").empty();
	var enterprises = new Mast.components.EnterprisesSettingsComponent();
	enterprises.displayEnterpriseDetails();
};
