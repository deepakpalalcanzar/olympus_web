/*---------------------
	:: Share
	-> model
---------------------*/
Share = Model.extend({

  tableName: 'share',

  name: STRING,
  hasMany: ['Account'],
  belongsTo: ['Directory', 'File'],

  instanceMethods: {
  	getLink: function () {
  		return '/share/' + this.id;
  	}
  }
});
