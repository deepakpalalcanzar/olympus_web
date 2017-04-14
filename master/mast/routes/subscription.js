Mast.routes.subscription = function(query,page) {
// Empty container
	$("#content").empty();
	var subscriptionPage = new Mast.components.SubscriptionPage();
};

Mast.routes.addsubscription = function(query,page) {
// Empty container
	$("#content").empty();
	new Mast.components.AddSubscriptionComponent();
};

Mast.routes.listsubscription = function(query,page) {
// Empty container
	$("#content").empty();
	new Mast.components.ListSubscriptionPage();
};

Mast.routes['subscription/updatesubscription'] = function(query, page) {
	$("#content").empty();
	var update = new Mast.components.UpdateSubscriptionComponent();
};

Mast.routes['subscription/upgrade'] = function(query, page) {
	$("#content").empty();
	var subscriptionPage = new Mast.components.UpgradeSubscriptionPage();
};

Mast.routes['subscription/upgradeform'] = function(query, page) {
	$("#content").empty();
	var subscriptionPaid = new Mast.components.UpgradeSubscriptionFormComponent();
};

Mast.routes['subscription/proceed'] = function(query, page) {
	$("#content").empty();
	var proceed = new Mast.components.UpgradeProceedComponent();
};

Mast.routes['subscription/confirm'] = function(query, page) {
	$("#content").empty();
	var confirm = new Mast.components.UpgradeConfirmComponent();
};


