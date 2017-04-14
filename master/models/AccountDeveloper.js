AccountDeveloper = Model.extend({
  tableName: 'accountdeveloper',

	api_key 		: STRING,
	account_id 		: INTEGER,
	code 			: STRING,
	access_token	: STRING,
	refresh_token 	: STRING,
	code_expires 	: DATE,
	access_expires 	: DATE,
	refresh_expires : DATE,
	scope 			: INTEGER
});

AccountDeveloper.SCOPE_READ = 1;
AccountDeveloper.SCOPE_WRITE = 2;
