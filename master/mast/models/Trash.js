/**
 * Collection containing the top level workgroups
 */
Mast.models.Trash = Mast.Collection.extend({	
	model: 'Trashnode',
	url: '/inode/deleted',
	autoFetch: false
});