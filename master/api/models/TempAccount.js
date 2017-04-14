/*---------------------
  :: TempAccount
  -> model
---------------------*/

TempAccount =  Model.extend({

  tableName: 'tempaccount',

    email: {
      type: 'string',
      unique: true,
      required: true
    },

    password: {
      type: 'string',
      minLength: 3,
      required: true
    },

    name: {
      type: 'string',
      minLength: 3,
      maxLength: 25,
      required: true
    },

    is_enterprise: {
      type: 'boolean',
      defaultsTo: false
    },
  
});
