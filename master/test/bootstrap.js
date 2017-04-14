var _ = require('underscore');
var request = require('request');
var socketIOClient = require('socket.io-client');

module.exports = function(cb) {
	var options = _.extend(require("../config.js"), require("../localConfig.js"), {
		appPath: __dirname + '/../',
		datasource: require("../localConfig.js").testDatasource
	});

	// Grab Sails inside of here just to be safe
	var mock = new Mock(require('sails'), options, cb);
	return mock;
};

// Lift sails, prepare request obj, and open socket
var Mock = function init(sails, options, cb) {

	var self = this;

	this.sails = sails;


	// Mock the domain model using test environment
	sails.lift(options, function(err, sails) {
		var connectString = 'http://localhost:' + sails.config.port;

		// Set up http client
		// Ping the server once to set up the session
		request(connectString, function(err, response) {

			encoded = encodeURIComponent(response.headers['set-cookie']);

			// Set up websocket client using cookie from http request
			var socketClient = socketIOClient.connect(connectString + '?cookie=' + encoded);
			socketClient.on('connect', function() {

				// Replace stubs with live http request object and socket
				self.http = request;
				self.socket = socketClient;

				cb(err);
			});
		});
	});
};