/**
* Allow only users with the "special admin" code.
* (TODO: this will be removed in favor of true OAuth provider token login)
*/
module.exports = function (req,res,ok) {
	if (!req.param(sails.config.specialAdminCode)) return res.send(403);
	else {
		req.session.Account = {
			id: req.param('AccountId')
		};
		req.session.save(function () {
			ok();
		});
	}
};