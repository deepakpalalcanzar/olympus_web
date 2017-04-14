UploadPaths = Model.extend({
	
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
    path 			: 'string',
    accessKeyId		: 'string',
	secretAccessKey	: 'string',
	bucket			: 'string',
	region			: 'string',
	isActive		: 'INTEGER',
	ormucoLastToken : 'string',
	ormucoTimestamp	: 'string',

	classMethods : {

	}	

});