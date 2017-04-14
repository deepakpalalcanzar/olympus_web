/*---------------------
  :: Subscription
  -> model
---------------------*/
Subscription =  Model.extend({

	tableName: 'Subscription',
    features: {
		type: 'string',
  		unique: false,
  		required: true
	},

    price: {
      type: 'decimal',
      required: true
    },

	duration: {
  		type: 'string',
  		required: true
	},

    users_limit: 'string',
    workgroup_limit: 'string',
    quota: 'string',
    
});
