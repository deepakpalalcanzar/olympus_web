// permission types
//
// read
// comment
// edit
// admin
//

DirectoryPermission = Model.extend({
	tableName: 'directorypermission',

	type: STRING,

	orphan: BOOLEAN,

	// isLocked: BOOLEAN,

	belongsTo: ['Directory','Account'],

	classMethods: {
		/**
		* Return files which match the specified criteria
		*/
		findWhere: function (criteria) {
			return function (cb) {
				DirectoryPermission.findAll({
					where: criteria
				}).done(cb);
			};
		}
	},
	instanceMethods: {
		doSomethingWithThisInstance: function () {}
	}
});
