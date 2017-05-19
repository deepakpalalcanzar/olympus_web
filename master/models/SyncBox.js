SyncBox = Model.extend({

	tableName: 'syncbox',

	// id: {
	// 	type: INTEGER,
	// 	//defaultValue: 0
	// },

	// path: {
	// 	type: INTEGER,
	// 	// defaultValue: 0
	// },

	account_id 		: INTEGER,
	// code 			: STRING,
	access_token	: STRING,
	refresh_token  	: STRING,
	token_type      : 'string',
    uid             : 'string',
    bxaccount_id   : 'string'

	/*classMethods : {

		// Return files which match the specified criteria
		findOne: function (criteria, cb) {
			return function (cb) {
				SiteSettings.findOne({
					where: criteria
				}).done(cb);
			};
		}
	}	*/

});