/**
 * Utility Helpers for creating model object
 */

var Utils = module.exports = {};


/**
 * Create Account
 */

Utils.createAccount = function(options, cb) {
  Account.create({
    email: 'foo@foobar.com',
    password: 'abc123',
    name: 'foo bar',
    isAdmin: options.isAdmin || false
  }).exec(cb);
};


/**
 * Create AccountDeveloper
 */

Utils.createAccountDeveloper = function(accountId, cb) {

  // set to 10 days in the future
  var expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 10);

  AccountDeveloper.create({
    api_key: 'abc123',
    account_id: accountId,
    code: 'abc123',
    access_token: 'abc123',
    refresh_token: 'abc123',
    code_expires: expiresDate,
    access_expires: expiresDate,
    refresh_expires: expiresDate,
    scope: 3
  }).exec(cb);
};


/**
 * Create Directory
 */

Utils.createDirectory = function(name, options, cb) {
  Directory.create({
    name: name,
    DirectoryId: options.DirectoryId || null,
    OwnerId: options.OwnerId || null
  }).exec(function(err, directory) {
    if(err) return cb(err);

    Utils.createDirectoryPermissions(directory.id, options || {}, function(err, dirPerm) {
      return cb(err, directory);
    });
  });
};


/**
 * Create Directory Permissions
 */

Utils.createDirectoryPermissions = function(dirId, options, cb) {
  DirectoryPermission.create({
    type: options.type || 'write',
    DirectoryId: dirId,
    AccountId: options.AccountId || 1
  }).exec(cb);
};


/**
 * Create File
 */

Utils.createFile = function(options, cb) {
  File.create({
    name: options.name || 'foo',
    DirectoryId: options.dirId || 1
  }).exec(function(err, file) {
    if(err) return cb(err);
    Utils.createFilePermissions(file.id, options, function(err, filePerm) {
      return cb(err, file);
    });
  });
};


/**
 * Create File Permissions
 */

Utils.createFilePermissions = function(fileId, options, cb) {
  FilePermission.create({
    type: options.type || 'write',
    FileId: fileId,
    AccountId: options.AccountId || 1
  }).exec(cb);
};
