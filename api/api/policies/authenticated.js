/**
 * Allow any authenticated user.
 */

var OAuthHelper = require('../services/lib/OAuth');

module.exports = function (req, res, next) {
  if (sails.config.environment === 'development') return next();

  // HACKY HACK HACK
  if(req.param('_session')) {
    req.session.authenticated = req.body._session.authenticated;
    req.session.Account = req.body._session.Account;
  }

  // If a socket request or xhr request return 403
  if (req.isSocket || req.xhr) {
    return res.send(403);
  }

  // If User is logged in
  if (req.session.authenticated) {
    // req.socket.join('Account_' + req.session.Account.id);
    return next();
  }

  // If an Authorization header is set
  if (req.headers['authorization']) {
    return OAuthHelper.verify(req, function(status) {
      if(!status) return res.send(403);
      if(!req.api_authenticated) return res.send(403);

      // req.socket.join('Account_' + req.session.Account.id);
      return next();
    });
  }

  res.redirect('/login');
};
