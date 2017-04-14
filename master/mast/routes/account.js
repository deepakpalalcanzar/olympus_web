Mast.routes.account = function(query, page) {
	// Empty container
	$("#content").empty();
	Mast.navigate('account/details');
};

Mast.routes['account/details'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displayAccountDetails();
	/*Olympus.ui.actionBar.append();
	Olympus.ui.actionBar.updateButtonState();*/
};

Mast.routes['account/password'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displayAccountPassword();
	/*Olympus.ui.actionBar.append();
	Olympus.ui.actionBar.updateButtonState();*/
};

Mast.routes['account/appearance'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displayAppearance();
};

Mast.routes['account/settings'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displayAccountSettings();
};

Mast.routes['account/systemsettings'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displaySystemSettings();
};

Mast.routes['account/notifications'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displayAccountNotifications();
};

Mast.routes['account/subscription'] = function(query, page) {
	$("#content").empty();
	var account = new Mast.components.AccountSettingsComponent();
	account.displaySubscribedPlan();
};