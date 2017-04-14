var UUIDGenerator = require('node-uuid');

var TestController = {
	index: function(req,res){
		res.view();
	},
	
	upload: function (req,res) {
		
		// Parse form data from server
//		var parsedFormData = JSON.parse(req.param('data'));
		
		sails.log.debug(req.param('data'));
		res.json({
			success: "true",
			data: req.param('data')
		});
		return;
		
		// Iterate through each uploaded file
		var resultSet = [];
		async.forEach(req.files.files,function(file,cb) {
			async.auto({
				// Calculate new path and filename, using a UUID and the old extension
				metadata: function(cb){
					var uuid = UUIDGenerator.v1(),
						newFileName= uuid + "." + _.str.fileExtension(file.name),
						newPath= config.appPath+"/public/files/"+newFileName;
					cb(null,{
						uuid: uuid,
						newFileName: newFileName,
						newPath: newPath
					});
				},
				// Read temp file
				readFile: function(cb,r){	
					sails.log.debug(file.path);
					fs.readFile(file.path,cb);
				},
				// Save File to database
				saveToDb: ['metadata',function(cb,r){
					File.create({
						name: file.name,
						size: file.size,
						fsName: r.metadata.newFileName
					}).success(function(f) {
						// Move file into target directory, inheriting permissions
						f.mv(parsedFormData.parent.id,cb);
					});
				}],
				// Write file to destination
				writeFile: ['readFile','metadata',function(cb,r){
						sails.log.debug("writing to",r.metadata.newPath);
						sails.log.debug("file data",r.readFile,r.metadata);
					fs.writeFile(r.metadata.newPath,r.readFile,cb);
				}]
			},function(err,res){
				resultSet.push({
					name: res.saveToDb.name,
					size: res.saveToDb.size,
					DirectoryId: parsedFormData.parent.id
				});
				cb(err,res);
			});
		},
		// And respond
		function(err) {
			res.json({
				api: APIService.File.mini(resultSet),
				_origFiles: req.files.files
			});
		});
	},
	
	test: function(req,res) {
		res.json({
			success: true,
			message: 'TEST',
			params: req.params,
			body: req.body,
			query: req.query
		});
		res.redirect('/test/test2');
	},
	test2: function(req,res) {
		res.json({
			success: true,
			message: 'TEST2',
			params: req.params,
			body: req.body,
			query: req.query
		});
	},

	// testing of the reset password flow
	resetPassword: function(req, res) {
		res.view('auth/reset_password');
	},

	// testing of the check email password flow
	checkEmail: function(req, res) {
		res.view('auth/check_your_email');
	},

	// testing of the creating new password flow
	createPassword: function(req, res) {
		res.view('auth/create_new_password');
	}
};
_.extend(exports,TestController);