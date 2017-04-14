// Check if logged-in user has permission to..
module.exports = function(action) {
	return function(req, res, next) {

		// Temporary override for access w/ admin token
		if (req.param(sails.config.specialAdminCode)) {
			req.session.Account = {
				id: 1,
				name: 'Olympus Secret Admin'
			};
			req.isSocket && req.session.save();
			return next();
		}

		// Check that the user is authenticated (logged in or has a valid api access token)
		// and then verify that the authenticated user has permission to do what they want
		sails.policies.authenticated(req, res, function() {

			// capitalize inodeType for use with Model.getModelName()
			var inodeType = _.capitalize(req.param('controller')),
				inodeId = req.param('id') || req.param('parent_id') || (req.param('parent') ? req.param('parent').id : null),
				accountId = req.session.Account && req.session.Account.id;

			// If action unspecified, default to request action
			action = action || req.param('action');

			// Check whether account has proper permissions to access the item in question
			Account.can(action, inodeId, inodeType, accountId, function(err, allowed) {
				if (allowed) {
					Account.subscribe(req,req.session.Account.id);
					next();
				}
				else {
					res.send(403);
				}
			});
		});

	};
};