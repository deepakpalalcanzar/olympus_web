/*---------------------
:: SiteSettings
-> model
---------------------*/
module.exports = {

    attributes: {

        allowSignupfromMobile           : 'INTEGER',
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
        dropboxClientSecret             : 'string',
        boxSync							: 'INTEGER',
        boxClientId       				: 'string',
        boxClientSecret                 : 'string',
        // gdriveSync						: 'INTEGER',
        // ormucoLastToken					: 'string',
		// ormucoTimestamp					: 'string',
    }
};