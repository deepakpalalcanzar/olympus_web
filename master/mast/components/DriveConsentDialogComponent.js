Mast.registerComponent('DriveConsentDialogComponent', {

	extendsFrom: 'DialogComponent',
	collection: Mast.Collection.extend({url: '/directory'}),
	template: '.drive-consent-template',
	outlet: '#content',

	events : {
    	'click .upload-button' : 'updateDriveConsentCode'
    },

	init: function(){

		var self = this;
		var authorizeUrl 	= this.get('authorizeUrl');
		console.log('authorizeUrlauthorizeUrlauthorizeUrlauthorizeUrlauthorizeUrl');
		console.log(authorizeUrl);
	},

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

	updateDriveConsentCode: function(){
		console.log('4747474747474747474747474747474747474747474747');
		// console.log($('.drive-consent-template .popup-box-input').length);
		console.log($('.drive-consent-template .popup-box-input').val());
		refresh_token = $('.drive-consent-template .popup-box-input').val();
		if(refresh_token && refresh_token.trim() != ''){
			this.closeDialog();
			console.log('sending the token to olympus.');
			Mast.Socket.request('/directory/syncdrive',{
				'drive_action': 'save_drive_token',
				'refresh_token': refresh_token,//'4/cloM0J79v0XB8VpfrGFEKo_gA--stxvkdmaYD0XKvjI'
			},
			function(res, other) {
				// if(typeof res.authorizeUrl != 'undefined'){
				// 	var driveConsent = new Mast.components.DriveConsentDialogComponent({},{
				// 		authorizeUrl 	: res.authorizeUrl
				// 	});
				// }
				console.log('donedonedonedonedonedonedonedonedone');
				console.log(res);
				console.log(other);
				// Add to collection
				// currentInode.collection.add([res]);

				// currentInode.collection.where({
				// 	id: res.id
				// })[0].set('editing',true);
			});
		}else{
			console.log('Please visit the url first, and enter the code from that page.');
		}
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