/*---------------------
	:: Organization
	-> model
---------------------*/
Organization = Model.extend({
	tableName: 'organization',

	avatar_fname: STRING,
	avatar_mime_type: STRING

	// Attributes/Schema
	//
	// ex.
	// attrName: {
	//	type: STRING,
	//	validate: {
	//	is: ['someValue','someOtherValue']
	//	}
	// },

	// Associations
	//
	// ex.
	// belongsTo: [ 'SomeModel', 'SomeOtherModel']

});
