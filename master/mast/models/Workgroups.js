/**
 * Collection containing the top level workgroups
 */
Mast.models.Workgroups = Mast.Collection.extend({	
	model: 'INode',
	url: '/inode/topLevel',
	autoFetch: false
});