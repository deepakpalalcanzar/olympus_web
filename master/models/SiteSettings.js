SiteSettings = Model.extend({
	
	tableName: 'sitesettings',

	// id: {
	// 	type: INTEGER,
	// 	//defaultValue: 0
	// },

	// path: {
	// 	type: INTEGER,
	// 	// defaultValue: 0
	// },

	ldapOn 			: 'INTEGER',
	ServiceType		: 'INTEGER',
    ldapServerIp 	: 'string',
    ldapOU			: 'string',
	ldapBaseDN		: 'string',
	ldapAdmin		: 'string',
	ldapPassword	: 'string',
	ldapCreateUser	: 'INTEGER',

	classMethods : {
		/**
		* Return files which match the specified criteria
		*/
		findOne: function (criteria, cb) {
			return function (cb) {
				SiteSettings.findOne({
					where: criteria
				}).done(cb);
			};
		}
	}	

});