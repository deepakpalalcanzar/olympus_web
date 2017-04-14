// TODO: namespace tables generated during testing (clone the models)

// TODO: better yet, use a separate database

// Shortcut to mock the domain model
var sails = require('sails');
var load = function (cb) {
	sails.load({
		appName: "Olympus | Sharing the Cloud",

		appPath: __dirname+'',

		appEnvironment: 'development',

		datasource: {
			database: 'olympus',
			username: 'olympus',
			password: 'olympus',
			
			dbCreate: 'create'
		},

		rigging: true,

		socket:true
	},cb)
};

exports.bootstrapDb = function() {
	var done = this.callback;
	async.auto({
		mockDomainModel: function(cb,rs) {
			load(cb);
		},
				
		createSomeEntities: ['mockDomainModel',function(cb,rs) {
			async.auto({
				accountA: function(cb, results){
					Account.findOrCreate({
						username:'testAccountA',
						password: 'abc123'
					},['username'],cb);
				},
				accountB: function(cb, results){
					Account.findOrCreate({
						username:'testAccountB',
						password: 'abc123'
					},['username'],cb);
				},
				directoryA: function(cb, results){
					Directory.findOrCreate({
						name: 'dA_testdir28395'
					},['name'],cb);
				},
				directoryB: function(cb, results){
					Directory.findOrCreate({
						name: 'dB_testdir28395'
					},['name'],cb);
				},
				fileA: ['directoryA',function(cb, results){
					File.findOrCreate({
						name:'fA_testfile28395',
						DirectoryId:results.directoryA.id
					},['name'],cb);
				}],
				fileB: ['directoryB',function(cb, results){
					File.findOrCreate({
						name:'fB_testfile28395',
						DirectoryId:results.directoryB.id
					},['name'],cb);
				}]
			},cb);
		}]
	},function(err,results){
		// Pass just the created entities back for use in subsequent tests
		sails.log.debug("8************",results.createSomeEntities);
		done(err,results.createSomeEntities);
	});	
};