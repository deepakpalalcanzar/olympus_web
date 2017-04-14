Role = Model.extend({
	tableName: 'role',

	name: STRING,

	hasMany: [ 'Account' ]
});
