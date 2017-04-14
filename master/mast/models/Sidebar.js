Mast.models.Sidebar = Mast.Model.extend({
	
	defaults: function() {
		return {
			type       : 'directory',
			name       : 'iNode name',
			mimeClass  : '',
			modifiedAt : null,
			modifiedBy : '',
			numUsers   : 0,
			numActive  : 0,
			numComments: 0,
			size       : 1024,
			sizeInMB   : 1,
			depth      : 0,
			state      : '',
			empty      : true,
			selected   : false,
			editing    : false,
			visible    : false,
			activeTemplate: 'activityTemplate'
		};
	}
});