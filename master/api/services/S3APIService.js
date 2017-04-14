var assert = require('assert');
var amazonS3 = require('awssum-amazon-s3');

// Validate configuration
// Get keys from config or environment
var config = {
	accessKeyId: sails.config.fileAdapter.s3.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: sails.config.fileAdapter.s3.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
	// awsAccountId: sails.config.fileAdapter.s3.awsAccountId || process.env.AWS_ACCOUNT_ID,
	bucket: sails.config.fileAdapter.s3.bucket || process.env.AWS_BUCKET,
	region: require('awssum-amazon')[sails.config.fileAdapter.s3.region || process.env.AWS_REGION]
};

// Immediately instantiate this service using API credentials. 
var s3 = new amazonS3.S3(config);

/**
 * Upload a local file
 *	@options
 *		@name
 *		@contentLength
 *		@payload
 *	@cb
 */
module.exports.upload = function(options, cb) {

	// creation of bucket was ok, now let's put an object into it
	s3.PutObject({
		BucketName: config.bucket,
		ObjectName: options.name,
		ContentLength: options.contentLength,
		Body: options.payload
	}, function(err, data) {
		cb(err, data);
	});
};

/**
 * Download a file
 */
module.exports.download = function(options, cb) {

	// creation of bucket was ok, now let's put an object into it
/*	s3.GetObject({
		BucketName: config.bucket,
		ObjectName: options.name
	}, {stream: true}, function(err, data) {
		cb(err, null, null, data.Stream);
	});
*/
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

	s3.GetObject({
		BucketName: config.bucket,
		ObjectName: options.name
	},  {stream: true}, function(err, data) {
		cb(err, null, null, data.Stream);
	});

};