Mast.registerModel('CurrentViewer',{
	_class		: 'CurrentViewer',
	
	defaults: function() {
		return {
			avatar			: '/images/avatar_anonymous.png',
			name			: 'some Name',
			accountRole		: 'someRole here'
		}
	}
});

Mast.registerCollection('CurrentViewers',{
	
	load: function(inodeAttrs) {
		var self = this;
		this.url = ((inodeAttrs.type=='directory') ?							// Determine which url(controller) to request (depends on whether this is a directory or a file)
			"/directory" : "/file") +
		"/swarm";
		this.inodeId = inodeAttrs.id;
		Mast.Socket.request(this.url,{											// Ask the server for current viewers
			id: inodeAttrs.id	
		}, function(res) {	
			self.reset(res);													// Reset this collection with the viewers from the server
		});
	},
	
	model	: 'CurrentViewer'

});