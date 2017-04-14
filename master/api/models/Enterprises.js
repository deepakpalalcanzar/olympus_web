/*---------------------
  :: Subscription
  -> model
---------------------*/
Enterprises =  Model.extend({

	tableName: 'Enterprises',
    name: {
        type: 'string',
        required: true
    },

    user: {
      type: 'string',
      required: true
    },

    workgroup: {
      type: 'integer',
    },

    is_impersonate: 'integer',
    
});
