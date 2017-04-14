Mast.registerComponent('AccountDetails', {

	model: {
		name : 'Enter your Name',
		phone: 'Enter your phone number',
		email: 'Enter your email',
		title: 'Enter your title'
	},

	template: '.account-details-template',

	events: {
		'click .submit-details': 'updateAccountDetails',
		'click input': 'selectText',
		'click .delete-account': 'deleteAccount',
	},

	regions: {
		'.image-uploader': 'ImageUploaderComponent'
	},


	afterCreate: function () {
		$('.upload-file').hide();

		// On tablet, hide the upload logo option
		if (Mast.isTouch) {
			this.$('.change-profile-pic').remove();
		}
	},

	// set model to the mast session account attributes. Useful for placing the attributes as
	// placeholder text.
	afterConnect: function() {
		this.set(Mast.Session.Account);
	},

	afterRender: function(){		
		// Set uploader endpoint.
		this.children['.image-uploader'].children['.uploader'].set('endpoint','/account/imageUpload');
//		this.$('.profile-pic').attr('src','/account/avatar');

		Mast.Socket.request('/account/getImage', { pic_type: 'profile'}, function(res, err, next) {
			if(res.avatar == '' && res.avatar == null){
				$('.user-avatar').attr('src','/account/avatar');			
				this.$('.profile-pic').attr('src','/account/avatar');
			}else if(res.avatar !== '' && res.avatar !== null){
				$('.user-avatar').attr('src', "/images/profile/"+res.avatar);			
				this.$('.profile-pic').attr('src', "/images/profile/"+res.avatar);
			}
		});
	},

	updateAccountDetails: function() {

		var self = this;
		console.log("aaaaaaaaaaaaaaaaaaaaa");
		console.log(fileData);
		
		if(typeof fileData !== 'undefined'){

			var file = fileData[0];
			var img = cropper.getDataURL();
			$('.cropped_profile_image').html('');
			$('.cropped_profile_image').append('<img src="'+img+'">');

			console.log("popopopopopoppopoppopopopopopopoppppopopopopopopoppopoppop");
				console.log(file);
			console.log("popopopopopoppopoppopopopopopopoppppopopopopopopoppopoppop");


			Mast.Socket.request('/account/imageUpload', { name:file.name, type:file.type, size:file.size, binary: img, pic_type : 'profile' }, function(req, res, next) {
				console.log("responseresponseresponseresponseresponseresponse");
					console.log(req);
					console.log(res);
				console.log("responseresponseresponseresponseresponseresponse");				
			});
			
			alert('Your account has been updated.');
			$('.user-avatar').attr('src', img);

		}else{

			var payload = this.getPayload();
			Mast.Socket.request('/account/update', payload, function(){
				alert('Your account has been updated.');
			});
			
		}
		// this.afterRender();
	},

// get account details payload and return that object
	getPayload: function() {
		var name, email, title, phone;
		return {
			name : this.$('input[name="name"]').val(),
			email: this.$('input[name="email"]').val(),
			title: this.$('input[name="title"]').val(),
			phone: this.$('input[name="phone"]').val()
		};
	},

	emptyForm: function() {
		this.$('input[name="name"]').val('');
		this.$('input[name="email"]').val('');
		this.$('input[name="title"]').val('');
		this.$('input[name="phone"]').val('');
	},

	selectText: function(e) {
		$(e.currentTarget).select();
	},

	deleteAccount: function(){

		var self = Mast.Session.Account;
		if(confirm('Are you sure ?')){
			Mast.Socket.request('/account/delOwnAccount', { id: self.id}, function(res, err){
				if(res){
					window.location = 'auth/logout';
				}
			});
		}
		
	},

});
