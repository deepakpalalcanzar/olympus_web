/*---------------------
:: UploadPaths
-> model
---------------------*/
module.exports = {

    attributes: {


        type 			: 'string',
        access_token 	: 'string',
        refresh_token	: 'string',
		token_type	    : 'string',
		expiry_date		: 'string',
		accountId		: 'INTEGER',
        // Add a reference to User
        // owner: {
        //   model: 'user'
        // }
    }
};