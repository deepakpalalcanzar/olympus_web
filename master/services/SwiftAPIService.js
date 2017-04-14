// var assert = require('assert');

// // Swift file store endpoint configuration
// var swift = {
// 	protocol		: sails.config.fileAdapter.keystone.protocol || "http://",
// 	host			: sails.config.fileAdapter.swift.host,
// 	port			: sails.config.fileAdapter.swift.port,
// 	serviceHash		: sails.config.fileAdapter.swift.serviceHash,
// 	pathPrefix		: sails.config.fileAdapter.swift.pathPrefix || 'v1',
// 	container		: sails.config.fileAdapter.swift.container
// };

// // Keystone authentication credentials
// var keystone = {		
// 	protocol:	sails.config.fileAdapter.keystone.protocol || 'http://',
// 	host:		sails.config.fileAdapter.keystone.host,
// 	port:		sails.config.fileAdapter.keystone.port,
// 	tenant:		sails.config.fileAdapter.keystone.tenant,
// 	username:	sails.config.fileAdapter.keystone.username,
// 	password:	sails.config.fileAdapter.keystone.password,
// 	pathPrefix: sails.config.fileAdapter.keystone.pathPrefix || 'v2.0'
// };


// // Trim slashes
// swift.pathPrefix = _.str.trim(swift.pathPrefix,'/');
// swift.container = _.str.trim(swift.container,'/');
// swift.serviceHash = _.str.trim(swift.serviceHash,'/');
// keystone.pathPrefix = _.str.trim(keystone.pathPrefix,'/');


// // TODO: Don't do it this way!
// // Fine for now, until multiple swift adapters are instantiated at once:
// var token = {};

// /**
//  * Upload a file
//  *	@options
//  *		@name
//  *		@contentLength
//  *		@payload
//  *	@cb
//  */
//  exports.upload = function upload (options, cb) {
// 	// Refresh token

// 	getAuthToken(function (err,token) {
// 		if (!token || err) return cb(err || "Token could not be retrieved!");

// 		// Submit request to Swift
// 		var uri = swift.protocol + swift.host + ":" + swift.port + '/' + swift.pathPrefix + '/' + swift.serviceHash + '/' + swift.container + "/" + options.name;
// 		require('request')({
// 			method	: 'PUT',
// 			uri		: uri,
// 			headers	: {
// 				'X-Auth-Token': token.id,
// 				"Accept": "application/json"
// 			},
// 			body: options.payload
// 		}, function (err,resultObj, data) {
// 			sails.log.debug("Uploaded file to "+uri+"...");
// 			cb(err, data);
// 		});
// 	});
// };

// /**
//  * Download a file from Swift
//  */
// exports.download = function download (options, cb) {
// 	// Refresh token
// 	getAuthToken(function (err,token) {
// 		if (!token || err) return cb(err || "Token could not be retrieved!");

// 		// Submit request to Swift
// 		var uri = swift.protocol + swift.host + ":" + swift.port + '/' + swift.pathPrefix + '/' + swift.serviceHash + '/' + swift.container + "/" + options.name;
// 		var stream = require('request')({
// 			method	: 'GET',
// 			uri		: uri,
// 			headers	: {
// 				'X-Auth-Token': token.id
// 			}
// 		});
// 		cb(err,null,null,stream);
// 	});
// };

// /**
//  * Private:
//  * Verify (and update if necessary) the auth token, then store
//  * the updated token
//  */
// function getAuthToken (callback) {

// 	// If token exists, and it's not expired. use it!
// 	if (token && (new Date(token.expires) > new Date()) ) {
// 		callback(null,token);
// 	}
// 	else {
// 		// Build request
// 		var rconfig={
// 			url: keystone.protocol+''+keystone.host+':'+keystone.port+'/'+keystone.pathPrefix+'/tokens',
// 			headers: {
// 				'Content-Type': 'application/json'
// 			},
// 			method: 'POST',
// 			body: JSON.stringify({
// 				auth: {
// 					tenantName: keystone.tenant,
// 					passwordCredentials: {
// 						username: keystone.username,
// 						password: keystone.password
// 					}
// 				}
// 			})
// 		};

// 		// Send request
// 		require('request')(rconfig,function (err,resultObj,data) {
// 			try {
// 				// Parse and save token
// 				data = JSON.parse(data);
// 				token = data.access.token;
// 				callback(null,token);
// 			}
// 			catch (e) {
// 				callback ("Error parsing JSON in response: "+data);
// 			}
// 		});
// 	}
// }