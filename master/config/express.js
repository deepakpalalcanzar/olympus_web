var express = require('sails/node_modules/express');
module.exports.express = {
	bodyParser: function(req, res, next) {
		if (!req.headers['content-type'] || req.headers['content-type'].indexOf('multipart/form-data') === -1) {
			return express.bodyParser()(req, res, next);
		} else {
			return next();
		}
	}
}