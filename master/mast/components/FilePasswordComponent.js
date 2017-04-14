Mast.registerComponent('FilePasswordComponent', {
	
	template: '.file-password-template',

	events: {
		'click #submit-file-password': 'submitFilePassword'
	},

	submitFilePassword: function(e){

		var self = this;

		// console.log(this.$el.parents('.reset-password-outlet').attr('fsname'));
		file_fsname		= this.$el.parents('.reset-password-outlet').attr('fsname');
		file_password 	= this.$el.find('#password').val();

		if(file_password != ''){

// 			Mast.Socket.request('/tempaccount/submitFilePassword',											// Ask the server for current viewers
// 			{
// 				fsName		: file_fsname,
// 				password	: file_password
// 			}, function(res) {

// 				console.log(res);
// 				if(res.type == 'success'){
// 					location.reload();
// 					console.log('reloading...');
// 				}else{
// console.log('not reloading...');
// 				}
// 				// alert(res);

// 				if (res.status === 403) {
// 					return;
// 				}
// 			});
		}else{
			alert('Password is required.');
			e.preventDefault();
			e.stopPropagation();
		}
	}
	
});