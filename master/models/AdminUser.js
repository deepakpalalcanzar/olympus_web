AdminUser = Model.extend({

	tableName			: 'adminuser',
	user_id 			: INTEGER,
	admin_profile_id 	: INTEGER,

	classMethods: {

		listAdminUser: function(){

			var sql = "SELECT * from adminuser";
       		sql = Sequelize.Utils.format([sql]);
       		sequelize.query(sql, null, {
        		raw: true
       		}).success(function(directory) {
        		res.json(directory, 200);
       		}).error(function(e) {
				throw new Error(e);
       		});

		},

	},
});