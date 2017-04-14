CloudPaths = Model.extend({
	
	tableName: 'uploadpaths',

	// id: {
	// 	type: INTEGER,
	// 	//defaultValue: 0
	// },

	// path: {
	// 	type: INTEGER,
	// 	// defaultValue: 0
	// },

	type 			: 'string',
    access_token 	: 'string',
    refresh_token	: 'string',
	token_type	    : 'string',
	expiry_date		: 'string',
	accountId		: 'INTEGER',

	classMethods : {

	}	

});