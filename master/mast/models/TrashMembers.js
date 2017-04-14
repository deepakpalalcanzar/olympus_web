/**
	* Collection containing the members (Files and Directories) of a Directory
*/

Mast.models.TrashMembers = Mast.Collection.extend({
	
	autoFetch: false,
	// Will be replaced by the proper directory id
	model: 'Trashnode',

	// Get children of this directory from the server
	// After fetch from server, mark each child as a File or Directory
	// Marshal server-side data into presentable format
	// Add class to each model to identiy them as files or dirs later
	
	fetchMembers: function (thisDir,cb) {
		var self = this;
		Mast.Socket.request('/trash/list',{
			id: thisDir.get('id')
		}, function(res) {
			if (_.isArray(res)) {
				self.reset(_.map(res, function(i) {
					return _.extend({},Mast.models.Trashnode.prototype.marshal(i),{
						depth: thisDir.get('depth')+1,
						parent: _.extend({}, thisDir, {id:thisDir.get('id')})
					});				
				}));
				self.map(function(value, key) {
					value._class = value.attributes.type;
					return value;
				}); 
			} else {
				debug.warn("There was an issue accessing the directory:",res);
			}
			cb && cb();
		});
	}

});
