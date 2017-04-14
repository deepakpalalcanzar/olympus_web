Mast.registerComponent('UploadFileDialogComponent', {

	extendsFrom: 'DialogComponent',
	collection: Mast.Collection.extend({url: '/directory'}),
	template: '.upload-dialog-template',
	outlet: '#content',

	afterRender: function(){
		
// Call inherited afterRender.
		Mast.components.DialogComponent.prototype.afterRender.call(this);
// If the folder is collapsed, expand it.
		if (Olympus.ui.fileSystem.model.attributes.selectedInode.get('type') == 'directory' && Olympus.ui.fileSystem.model.attributes.selectedInode.get('state') != 'expanded') {
			Olympus.ui.fileSystem.model.attributes.selectedInode.expand();
		}

// Set uploader endpoint.
		this.children['.uploader'].set('endpoint','/files/content');
	},

	bindings: {
		// Displayed/hides the ajax spinner if user is uploading or finished uploading file.
		uploading: function(newVal) {
			if (newVal) {
				// Since we have the progress bar, we'll close the dialog as soon as we start the upload
				this.closeDialog();
			}
		}
	}
});