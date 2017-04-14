Mast.registerComponent('ImageUploaderComponent', {

	model: {
		uploading: false,
		fileData : ''
	},

	template: '.image-uploader-template',

	regions: {
		'.uploader': 'Uploader'
	},

	events: {
		"click #btnSave" : 'uploadAvatar',
	}, 

	bindings: {
		uploading: function(newVal) {
			if (newVal) {
				this.$('.loading-spinner').show();
			} else {
				this.$('.loading-spinner').hide();
			}
		}
	},

	init: function(){
		var self = this;
		this.on('addFile',function(files){
			//self.set('uploading',true);
			self.uploadImage(files);
		});

	//	this.on('uploadComplete',this.afterUpload);
	},

	// Gives permission for upload process to take place
	//uploadImage: function() {
	//	this.children['.uploader'].trigger('submit');
	//},

	// Gives permission for upload process to take place
	uploadImage: function(input) {

		console.log("input input input inputinput input input input input");
		var self = this;
		if (input[0]) {

			if (input[0].type !== "image/jpeg" && input[0].type !== "image/jpg" && input[0].type !== "image/png" && input[0].type !== "image/gif") {
				alert("Please upload jpeg, jpg, gif and png");
			}else{

				var reader = new FileReader();
			    reader.onload = function(e) {
			    	this.set('fileData', input.files);
			    	fileData 		= input.files;
			        options.imgSrc 	= e.target.result;
			        cropper 		= $('.avatarBox').cropbox(options);
			    }
    
			    reader.readAsDataURL(input[0]);
			    input.files = [];
			}
		}
		// this.children['.uploader'].trigger('submit');
	},



	uploadAvatar: function(){
		
		var file = fileData['0'];
		console.log(file);
		console.log(this.get('fileData'));

		// if (file.type !== "image/jpeg" && file.type !== "image/jpg" && file.type !== "image/png" && file.type !== "image/gif") {
		// 	alert("Please upload jpeg, jpg, gif and png");
		// }else{
		// 	Mast.Socket.request('/account/imageUpload', { name:file.name, type:file.type, size:file.size, binary: fileBinary, pic_type: 'profile'}, function(req, res, next) {
		// 	});
		// }
	},



	// Sets uploading to false which will stop the spinner when the file is uploaded
	afterUpload: function (data) {
		var self = this;
		this.$('.loading-spinner').hide();
		if (data.success == false) {
			switch (data.error) {
				case 'toobig':
					alert('The file you uploaded was too big.  Please limit files to 5 megabytes.');
					break;
				default:
					alert('An error occurred; please try again later.');
					break;
			}
		} else {
			// Set the avatar image source to the new image.
			this.$('.profile-pic').attr('src',data.url);
			// Set a callback for when the avatar finishes downloading, so that we can show the loading spinner until then.
			if (this.$('.profile-pic').imagesLoaded) {
				this.$('.profile-pic').imagesLoaded({done:function($images){self.set('uploading',false);}});
			}
		}
	}


});
