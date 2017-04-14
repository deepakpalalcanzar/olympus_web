Mast.registerComponent('VerifyComponent', {

	template: '.verify-container',

	outlet: '.verification-page',

	regions: {
		'.image-uploader': 'ImageUploaderComponent'
	},

	code: null,

	afterCreate: function () {
		// On tablet, hide the upload logo option
		if (Mast.isTouch) {
			this.$('.image-uploader').remove();
		}
	},
	afterRender: function(){
		
		// Set uploader endpoint.
		this.children['.image-uploader'].children['.uploader'].set('endpoint','/account/imageUpload?code='+this.code);
	}


});