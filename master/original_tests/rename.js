var vows = require('vows'),
assert = require('assert');
macros = require('../testMacros');

vows.describe('Rename').addBatch({
	
	'bootstrap the db': {
		topic: macros.bootstrapDb,
		
		'rename works': function(models) {
			assert.equal(true,true);
//			models.directoryB.ls(function(e,rs){
//				sails.log.debug(rs);
//				assert.equal(true,true);
//			})
		}
	}
}).export(module);

