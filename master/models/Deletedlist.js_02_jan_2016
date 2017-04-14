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
				var basicSet = ["Delete from deletedlist where deleted_id=?"];
			}else{
				var basicSet = ["Delete from deletedlist where deleted_id=?"];
			}
			// var basicSet = ["Delete from deletedlist where deleted_id=?"];
			options.file_id && basicSet.push(options.file_id);
			basicSet = Sequelize.Utils.format(basicSet);
			sequelize.query(basicSet, null, {
            	raw	: true
	        }).success(function (resultSet) {
				cb(null, resultSet);
    	    });
		}
	}

});