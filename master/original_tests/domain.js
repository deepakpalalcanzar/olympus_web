var vows = require('vows'),
assert = require('assert');

// Shortcut to mock the domain model
var sails = require('sails');
var load = function (cb) {
	sails.load({
		appName: "Olympus | Sharing the Cloud",

		appPath: __dirname+'/../',

		appEnvironment: 'development',

		datasource: {
			database: 'testdb',
			username: 'sebastian',
			password: 'sebastian',
			
			dbCreate: 'create'
		},

		rigging: true,

		socket:true
	},cb)
};

// TODO: namespace tables generated during testing (clone the models)


vows.describe('Domain Model').addBatch({
	
	'after creating an Account, a Directory dA, a Directory dB, a File fA (in dA), and a File fB (in dB)': {
		topic: function () {
			var done = this.callback;
			load(function() {
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
				},done);
			})
		},
		
		

		'when permitting ls on fA, ': {
			topic: function (models) {
				models.fileA.permitLs(models.accountA,this.callback);
			},
			
			'(1)': {
				topic: function(filePermission,models){
					models.accountA.canLs(models.fileA,this.callback);
				},
				'accountA is allowed to ls fA': function (topic) {
					assert.isObject(topic);
				}	
			},
			
			
			'(2)': {
				topic: function(filePermission,models){
					models.accountB.canLs(models.fileA,this.callback);
				},
				'accountB is NOT allowed to ls fA': function (topic) {
					assert.isNull(topic);
				}	
			}
		},
		
		
		
		
		'when permitting ls on dB, ': {
			topic: function (models) {
				models.directoryB.permitLs(models.accountB,this.callback);
			},
			
			'(1)': {
				topic: function(filePermission,models){
					models.accountA.canLs(models.directoryB,this.callback);
				},
				'accountA is NOT allowed to ls dB': function (topic) {
					assert.isNull(topic);
				}	
			},
			
			'(2)': {
				topic: function(filePermission,models){
					models.accountA.canLs(models.fileB,this.callback);
				},
				'accountA is NOT allowed to ls fB': function (topic) {
					assert.isNull(topic);
				}	
			},
			
			
			'(3)': {
				topic: function(filePermission,models){
					models.accountB.canLs(models.directoryB,this.callback);
				},
				'accountB is allowed to ls dB': function (topic) {
					assert.isObject(topic);
				}	
			},

			'(4)': {
				topic: function(filePermission,models){
					models.accountB.canLs(models.fileB,this.callback);
				},
				'accountB is allowed to ls fB': function (topic) {
					assert.isObject(topic);
				}	
			},
			
			'when moving fA into dB': {
				topic: function (filePermission,models) {
					models.fileA.mv(models.directoryB,this.callback);
				},

				'(1)': {
					topic: function(stuff,filePermission,models){
						models.accountB.canLs(models.fileA,this.callback);
					},
					'accountB is allowed to ls fA': function (topic) {
						assert.isObject(topic);
						assert.equal(topic.__factory.name,'FilePermission');
						assert.equal(topic.type,'read');
					}
				}			
			}
			
		},
			
			
		'after creating an Account C, a Directory dC, a Directory dD, and assigning some permissions to dC': {
			topic: function () {
				async.auto({
					accountC: function(cb, results){
						Account.findOrCreate({
							username:'testAccountC',
							password: 'abc123'
						},['username'],cb);
					},
					fileC: function(cb, results){
						File.findOrCreate({
							name: 'fC_testfile28395'
						},['name'],cb);
					},
					fileD: function(cb, results){
						File.findOrCreate({
							name: 'fD_testfile28395'
						},['name'],cb);
					},
					directoryC: function(cb, results){
						Directory.findOrCreate({
							name: 'dC_testdir28395'
						},['name'],cb);
					},
					directoryD: function(cb, results){
						Directory.findOrCreate({
							name: 'dD_testdir28395'
						},['name'],cb);
					},
					allowLsOnDirC: ['directoryC','accountC',function (cb,results) {
						results.directoryC.permitLs(results.accountC,cb);
					}],
					moveD: ['directoryD','allowLsOnDirC',function(cb,results) {
						results.directoryD.mv(results.directoryC,cb);
					}],
					canLsD: ['moveD',function(cb,results) {
						results.accountC.canLs(results.directoryD,cb);
					}],
					copyFileC: ['fileC','directoryC','allowLsOnDirC',function (cb,results) {
						results.fileC.cp(results.directoryC,cb);
					}],
					canLsFileC: ['accountC','copyFileC',function(cb,results) {
						results.accountC.canLs(results.copyFileC,cb);
					}],
					directoryE: function(cb, results){
						Directory.findOrCreate({
							name: 'dE_testdir28395'
						},['name'],cb);
					},
					directoryF: function(cb, results){
						Directory.findOrCreate({
							name: 'dF_testdir28395'
						},['name'],cb);
					},
					fileE: function(cb, results){
						File.findOrCreate({
							name: 'fE_testfile28395'
						},['name'],cb);
					},
					mvFileE: ['fileE','directoryF',function (cb,results) {
						results.fileE.mv(results.directoryF,cb);
					}],
					mvDirF: ['directoryE','directoryF','mvFileE',function (cb,results) {
						results.directoryF.mv(results.directoryE,cb);
					}],
					copyDirE: ['mvDirF','directoryE','canLsFileC','directoryC',function(cb,results) {
						results.directoryE.cp(results.directoryC,cb);
					}],
				
					//
					// /c
					//   /eCopy
					//     /fCopy
					//       fileECopy
					//
					// /e
					//   /f
					//     fileE
					//
				
					canLsDirE: ['copyDirE','accountC',function(cb,results) {
						results.accountC.canLs(results.directoryE,cb);
					}],
					canLsDirECopy: ['copyDirE',function(cb,results) {
						results.accountC.canLs(results.copyDirE,cb);
					}],
				
					lsDirF: ['mvDirF',function(cb,rs) {
						rs.directoryF.ls(cb);
					}],
				
					lsDirE: ['mvDirF',function(cb,rs) {
						rs.directoryE.ls(cb);
					}],
					permitDirE: ['canLsDirE',function(cb,rs) {
						rs.accountC.permitLs(rs.mvFileE,cb);
					}],
				
					rmFileE: ['permitDirE',function(cb,rs) {
						rs.mvFileE.rm(cb);
					}],
				
					rmDirE: ['rmFileE',function(cb,rs) {
						rs.directoryE.rm(cb);
					}]
				},this.callback);
			},
				
			'moving directory dD into dC cascades permissions appropriately':function(models) {
				assert.isObject(models.canLsD);
			},
			
			'copying file fC into dC cascades permissions appropriately':function(models) {
				assert.isObject(models.canLsFileC);
			},
			'copying dir dE into dC cascades permissions appropriately':function(models) {
				assert.isNull(models.canLsDirE);
				assert.isObject(models.canLsDirECopy);
			},
			
			'ls dirF returns the correct number of files' : function(models) {
				assert.isArray(models.lsDirF);
				assert.equal(models.lsDirF.length,1);
				assert.equal(models.lsDirF[0].name,'fE_testfile28395');
				assert.equal(models.lsDirF[0].getModelName(),'file');
			},
			'ls dirE returns the correct number of files/dirs' : function(models) {
				assert.isArray(models.lsDirE);
				assert.equal(models.lsDirE.length,1);
				assert.equal(models.lsDirE[0].name,'dF_testdir28395');
				assert.equal(models.lsDirE[0].getModelName(),'directory');
			},
			
			'fileE was deleted properly': function (models) {
				assert.equal(models.mvFileE.deleted,true);
			},
			
			'directoryE was deleted properly': function (models) {
				assert.equal(models.directoryE.deleted,true);
			}
		
		}
			
	}
}).export(module);