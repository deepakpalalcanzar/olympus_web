/**
 * Handles OAuth Access Checking
 */

var OAuth = module.exports = {};

// Merge the current session with an account based on API auth header
OAuth.verify = function(req, cb) {

  // Flag as authenticated false
  req.api_authenticated = false;

  // If no authorization header, return false
  if (!req.headers['authorization']) return cb(false);

  // Split the header apart
  var authHeader = req.headers['authorization'].split(' ');
  var authType = authHeader[0];
  var access_token = authHeader[1];

  // Only accept Bearer tokens
  if (authType != 'Bearer') return cb(false);

  // Ensure an Access Token
  if (!access_token) return cb(false);

  // Check for a user that is linked to this api key and auth token
  AccountDeveloper.findOne({ 'access_token': access_token }).exec(function(err, model) {
    if (err) return cb(false);
    if (!model) return cb(false);

    // Make sure the token is not expired
    var now = new Date();

    if (model.access_expires < now) return cb(false);

    // If the account is valid, load it into the session
    Account.findOne(model.account_id).exec(function(err, account) {
      if (err) return cb(false);
      if (!account) return cb(false);

      req.api_authenticated = true;
      req.session.Account = account.toJSON();
      return cb(true);
    });
  });
};
