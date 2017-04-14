SiteOptions = Model.extend({
	
	tableName: 'siteoptions',

	// id: {
	// 	type: INTEGER,
	// 	//defaultValue: 0
	// },

	// path: {
	// 	type: INTEGER,
	// 	// defaultValue: 0
	// },

	allowSignupfromMobile 			: 'INTEGER',
	exportDbActive					: 'INTEGER',
	exportDbHost					: 'string',
	exportDbUser					: 'string',
	exportDbPass					: 'string',
	exportDbPath					: 'string',
	exportDbPort					: 'string',
	backupInterval					: 'string',
	privateKey						: 'string',
	gdriveSync						: 'INTEGER',
	gdriveClientId       			: 'string',
    gdriveClientSecret   			: 'string',
    gdriveRedirectUri    			: 'string',
    dropboxSync						: 'INTEGER',
    dropboxClientId       			: 'string',
    dropboxClientSecret     		: 'string',
    boxSync							: 'INTEGER',
    boxClientId       				: 'string',
    boxClientSecret       			: 'string',
	// ormucoLastToken					: 'string',
	// ormucoTimestamp					: 'string',

	classMethods : {
		/**
		* Return files which match the specified criteria
		*/
		// findOne: function (criteria, cb) {
		// 	return function (cb) {
		// 		SiteOptions.findOne({
		// 			where: criteria
		// 		}).done(cb);
		// 	};
		// }
	}	

});