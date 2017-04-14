/*var assert = require('assert');

// File management functionality
var Manager = exports.Manager = {

	// Manager-specific data
	manager: {
		host: config.swift.host,
		port: config.swift.port,
		pathPrefix: '/v1/' + config.swift.serviceHash // must have leading slash, but no trailling slash!
	},*/

	/**
	 * Upload a local file
	 */
/*	upload: function(session, options, req) {
		
		var self = this;
		this._refreshAuthToken(session, function() {
			assert.ok(session[self.handshake.tokenKey], "Swift auth token undefined!");
			var uploadStream = request({
				method: 'PUT',
				uri: "http://" + config.swift.host + ":" + config.swift.port + self.manager.pathPrefix + '/' + options.container + '/' + options.filename,
				headers: {
					'X-Auth-Token': session[self.handshake.tokenKey].id,
					"Accept": "application/json"
				}
			}, function(err, res, body) {
				if(!err && res && res.statusCode && res.statusCode >= 200 && res.statusCode <= 204) {
					return options.callback(err, res.statusCode);
				} else {
					if(!err) {
						err = new Error("request unsuccessful, statusCode: " + res.statusCode);
					}
					return options.callback(err, res.statusCode);
				}
			});
			
			_.shout("file",options.file);

			// Create file stream from on-disk tmp file
			var fileStream = fs.createReadStream(options.file.path);
			fileStream.pipe(uploadStream);
		});*/

		/*this._request(session, _.extend({}, options, {
			path: this.manager.pathPrefix + '/' + options.container + '/' + options.filename,
			method: 'PUT',
			multipart: false,
			data: rest.file(options.file.path, null, options.file.size, null, options.file.type),
			callback: function(response) {
				options.callback(self._toJSO(response));
			}
		}));*/
//	},

	/**
	 * Download a file
	 */
	/*download: function(session, options, req, res) {
		var self = this;
		this._refreshAuthToken(session, function() {
			assert.ok(session[self.handshake.tokenKey], "Swift auth token undefined!");

			var downloadStream = request({
				method: 'GET',
				uri: "http://" + config.swift.host + ":" + config.swift.port + self.manager.pathPrefix + '/' + options.path,
				headers: {
					'X-Auth-Token': session[self.handshake.tokenKey].id
				}
			}, function(err, res, body) {
				if(!err && res && res.statusCode && res.statusCode >= 200 && res.statusCode <= 204) {
					return options.callback(err,res.statusCode);
				} else {
					if(!err) {
						err = new Error("request unsuccessful, statusCode: " + res.statusCode);
					}
					return options.callback(err,res.statusCode);
				}
			});
			// downloadStream.pipe(fs.createWriteStream("/code/olympus/test.out"));
			downloadStream.pipe(res);
		});

		this._request(session, _.extend({}, options, {
			path: this.manager.pathPrefix + '/' + options.path,
			method: 'GET',
			callback: function(response) {
				// sails.log.debug(this.manager.pathPrefix+options.path);
				options.callback(response);
			}
		}));*/
//	},


	// Parse weird newline delimited format into javascript object
	/*_toJSO: function(sourceString) {
		return sourceString.split("\n");
	},

	_request: function(session, options) {
		var self = this;
		this._refreshAuthToken(session, function() {
			assert.ok(session[self.handshake.tokenKey], "Swift auth token undefined!");

			var reqOptions = _.extend({}, {
				host: self.manager.host,
				port: self.manager.port,
				path: self.manager.pathPrefix,
				method: "GET",
				headers: {
					'X-Auth-Token': session[self.handshake.tokenKey].id
				}
			}, options);

			_.shout("Refreshed auth token, requesting openstack w/ ", reqOptions);
			OpenStackAPIService._request(reqOptions);
		});
	}
}*/