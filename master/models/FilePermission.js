// permission types
//
// ls
// download
// upload
// mv
// share
//

FilePermission = Model.extend({

	tableName: 'filepermission',

	type: STRING,

	orphan: BOOLEAN,

	// isLocked: BOOLEAN,

	belongsTo: ['File', 'Account'],

	classMethods: {
		/**
		 * Return files which match the specified criteria
		 */
		findWhere: function(criteria) {
			return function(cb) {
				FilePermission.findAll({
					where: criteria
				}).done(cb);
			};
		}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function() {}
	}
});
