Deletedlist = Model.extend({

	tableName: 'deletedlist',

    type        : 'integer',
    deleted_id  : 'integer',
    sync_time   : 'datetime',
    user_id   	: 'integer',
    account_id  : 'integer',
    directory_id: 'integer',
    permission  : 'string',

	classMethods : {

		whoseParentIs: function(options, cb) {
			options = _.defaults(options, {
				attributes: {}
			});

			// Do initial query to get the list of inodes
			var basicSet = ["SELECT del.directory_id, del.permission, d.* from deletedlist del "+
							"INNER JOIN directory d ON d.id = del.deleted_id "+
							"where del.user_id=? and del.directory_id=?"];

			options.account_id && basicSet.push(options.account_id);
			options.directory_id && basicSet.push(options.directory_id);

			basicSet = Sequelize.Utils.format(basicSet);
			sequelize.query(basicSet, Directory).success(function(resultSet) {
				cb(null, resultSet);
			});
		},

		restore: function(options, cb){
			if(options.type === 'directory'){
				var basicSet = ["Delete from deletedlist where deleted_id=? or directory_id=?"];
				options.file_id && basicSet.push(options.file_id);
				options.directory_id && basicSet.push(options.file_id);

			}else{
				var basicSet = ["Delete from deletedlist where deleted_id=?"];
				options.file_id && basicSet.push(options.file_id);
			}

			basicSet = Sequelize.Utils.format(basicSet);
			console.log("basicSetbasicSetbasicSetbasicSetbasicSetbasicSet");
			console.log(basicSet);
			
			sequelize.query(basicSet, null, {
        		raw	: true
	        }).success(function (resultSet) {
				cb(null, resultSet);
    	    });
		},

		
		deleted : function(options, cb){

console.log('88888888888888888888888888888');
console.log(options.account_id);
			async.parallel({

				orphanDirectories: function(cb) {
					// var options = { accountId: req.session.Account.id };
					var sql 	= 	"SELECT del.directory_id, del.permission, d.* from deletedlist del "+
									"INNER JOIN directory d ON d.id = del.deleted_id "+
									"where del.account_id=? and del.type=2";
	    			sql 		= Sequelize.Utils.format([ sql, options.account_id ]);
	    			sequelize.query(sql, Directory).done(cb);
				},

				orphanFiles: function(cb){
					// var options = { accountId: req.session.Account.id };
					var sql 	= 	"SELECT del.directory_id, del.permission, f.* from deletedlist del "+
									"INNER JOIN file f ON f.id = del.deleted_id "+
									"where del.account_id=? and del.type=1 and directory_id != 0";
	    			sql 		= Sequelize.Utils.format([ sql, options.account_id ]);
	    			sequelize.query(sql, File).done(cb);
				}

			}, afterward);


			function afterward(err, results) {

				if (err) return res.send(500,err);
				var response = [];
				if (results.orphanDirectories) {
					// _.each(results.orphanDirectories,function(v,k) { // Subscribe to workgroups
					// 	v.subscribe(req);
					// });
					response = response.concat(APIService.Directory.deleted(results.orphanDirectories));
				}

				if (results.orphanFiles) {
					// _.each(results.orphanFiles,function(v,k) { // Subscribe to workgroups
					// 	v.subscribe(req);
					// });
					response = response.concat(APIService.File.deleted(results.orphanFiles));
				}

				cb(null, response);
				// res.json(response);

			}

		}
	}
});