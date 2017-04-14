Comment = Model.extend({
	tableName: 'comment',

	payload: STRING,

	belongsTo: ['File','Directory','Account']

});
