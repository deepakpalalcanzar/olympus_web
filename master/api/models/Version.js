Version = Model.extend({
	
	tableName: 'version',

	FileId: {
		type: INTEGER,
		defaultValue: 0
	},

	version: {
		type: INTEGER,
		defaultValue: 0
	},

	parent_id: {
		type: INTEGER,
		defaultValue: 0
	},

	classMethods : {

		createVersion: function (options, cb) {
			Version.create({
				FileId: options.fileId,
				version: options.version,
				parent_id: options.oldFile,
				AccountId : options.account_id, // AF
			}).done(function (err, versionResult){
				return cb();
			});
		},

		getMaxVersion: function (options, cb) {

			var versionData = new Array();
			Version.findAll({
				where: { parent_id: options.parentId }
			}).done(function (err, max){
				max.forEach(function(applicant)  {
					versionData.push(applicant.version);
				});
				var findMax = Math.max.apply( Math, versionData );
				cb(err, findMax);
			});
		},

		listVersion: function(options, cb){
			Version.findAll({
				where: { parent_id: options.parentId }
			}).done(function (err, max){
				cb(err, findMax);
			});
		},

	}	

});