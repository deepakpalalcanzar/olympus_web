/*---------------------
:: SiteSettings
-> model
---------------------*/
module.exports = {

    attributes: {

        ldapOn          : 'INTEGER',
        ServiceType     : 'INTEGER',
        ldapServerIp    : 'string',
        ldapOU          : 'string',
        ldapBaseDN      : 'string',
        ldapAdmin       : 'string',
        ldapPassword    : 'string',
        ldapCreateUser  : 'INTEGER',
        // Add a reference to User
        // owner: {
        //   model: 'user'
        // }
    }
};