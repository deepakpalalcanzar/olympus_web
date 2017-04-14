Mast.registerModel('Version',{
	defaults: function() {
		return {
			created_by : {
				name	: 'someName',
				avatar	: '/images/avatar_anonymous.png'
			},
			created_at	: 'someTime',
			message		: 'Default comment message'
		}
	}
});

Mast.registerCollection('Versions', {	
	model: 'Version',
	listVersion: function(inodeAttrs,callback) {
		var self = this;
		this.url = ((inodeAttrs.type=='directory') ?							// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") + "/version";
		Mast.Socket.request(this.url,{											// Ask the server for current viewers
			id: inodeAttrs.id	
		}, function(res) {
			self.reset(res);													// Reset this collection with the viewers from the server
			callback && callback();

		});
	}
}); 