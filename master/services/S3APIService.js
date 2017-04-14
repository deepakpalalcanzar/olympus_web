var assert = require('assert');
var amazonS3 = require('awssum-amazon-s3');
var MultiPartUpload 	= require('knox-mpu');
var knox 		= require('knox');

// Validate configuration
// Get keys from config or environment
// var config = {
// 	accessKeyId: sails.config.fileAdapter.s3.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
// 	secretAccessKey: sails.config.fileAdapter.s3.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
// 	// awsAccountId: sails.config.fileAdapter.s3.awsAccountId || process.env.AWS_ACCOUNT_ID,
// 	bucket: sails.config.fileAdapter.s3.bucket || process.env.AWS_BUCKET,
// 	region: require('awssum-amazon')[sails.config.fileAdapter.s3.region || process.env.AWS_REGION]
// };

// Immediately instantiate this service using API credentials. 
// var s3 = new amazonS3.S3(config);

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

	console.log('check If It Is Being Used Anymore And If region is needed to be in installer and superadmin settings as mandatory.');
	// console.log(options);
	var config = {
		accessKeyId: options.current_receiverinfo.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: options.current_receiverinfo.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
		// awsAccountId: sails.config.fileAdapter.s3.awsAccountId || process.env.AWS_ACCOUNT_ID,
		bucket: options.current_receiverinfo.bucket || process.env.AWS_BUCKET,
		region: require('awssum-amazon')[options.current_receiverinfo.region || process.env.AWS_REGION]
	};

	try{
		var s3 = new amazonS3.S3(config);
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
			if(err != null && err.StatusCode){
				cb(err, null, null, null);
			}else{
				cb(err, null, null, data.Stream);
			}
		});
	}catch(err){
		cb({StatusCode: 422, err: err}, null, null, null);
	}

};

module.exports.uploadProfile = function(options, cb) {

	var client = knox.createClient({
		key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey, 
		secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
		bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
	});

	var mpu = new MultiPartUpload({
        client: client,
        objectName: 'profile/'+options.name, // Amazon S3 object name
        file: sails.config.appPath + '/public/images/profile/'+options.name// path to the file
    },
    // Callback handler
    function(err, body) {

    	console.log('mpuBodympuBodympuBodympuBodympuBodympuBodympuBodympuBody');
    	if (err) {
    		console.log(err);
    	}
    	console.log(body);
    });
};

module.exports.uploadLogo = function(options, cb) {

	var client = knox.createClient({
		key: options.receiverinfo.accessKeyId,//sails.config.adapters.s3.apiKey, 
		secret: options.receiverinfo.secretAccessKey,//sails.config.adapters.s3.apiSecret,
		bucket: options.receiverinfo.bucket//sails.config.adapters.s3.bucket
	});

	var mpu = new MultiPartUpload({
        client: client,
        objectName: 'enterprises/'+options.name, // Amazon S3 object name
        file: sails.config.appPath + '/public/images/enterprises/'+options.name// path to the file
    },
    // Callback handler
    function(err, body) {

    	console.log('mpuBodympuBodympuBodympuBodympuBodympuBodympuBodympuBody');
    	if (err) {
    		console.log(err);
    	}
    	console.log(body);	                
    });
};