Mast.registerComponent('SyncDboxDialogComponent', {

	model : {
		syncpath: ''
	},

	extendsFrom: 'DialogComponent',
	// collection: Mast.Collection.extend({url: '/directory'}),
	template: '.syncdbox-dialog-template',
	outlet: '#content',

	afterRender: function(){
		
// Call inherited afterRender.
		Mast.components.DialogComponent.prototype.afterRender.call(this);
// If the folder is collapsed, expand it.
		// if (Olympus.ui.fileSystem.model.attributes.selectedInode.get('type') == 'directory' && Olympus.ui.fileSystem.model.attributes.selectedInode.get('state') != 'expanded') {
		// 	Olympus.ui.fileSystem.model.attributes.selectedInode.expand();
		// }

// Set uploader endpoint.
		this.set('syncpath','https://www.dropbox.com/1/oauth2/authorize?client_id=u4uh85nra00t22o&response_type=code&redirect_uri=https://localhost');
	},

	/*bindings: {
		// Displayed/hides the ajax spinner if user is uploading or finished uploading file.
		uploading: function(newVal) {
			if (newVal) {
				// Since we have the progress bar, we'll close the dialog as soon as we start the upload
				this.closeDialog();
			}
		}
	}*/
});