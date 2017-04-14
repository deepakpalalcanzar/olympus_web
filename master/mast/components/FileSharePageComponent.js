Mast.registerComponent('FileSharePageComponent', {
	
	template: '.file-sharepage-template',

	events: {
		'click #download-shared-file-button': 'downloadSharedFile'
	},

	downloadSharedFile: function(e){

// alert('test');
		var self = this;

		// console.log(this.$el.parents('.reset-password-outlet').attr('fsname'));
		file_fsname		= this.$el.parents('.file-sharepage-outlet').attr('fsname');
		filename		= this.$el.parents('.file-sharepage-outlet').attr('filename');
		dtoken			= this.$el.parents('.file-sharepage-outlet').attr('dtoken');
		window.open('/file/pDownload/'+dtoken+'/'+file_fsname+'/'+filename);
			/*Mast.Socket.request('/file/pDownload/'+file_fsname+'/'+filename,// Ask the server for current viewers
			{
				// fsName		: file_fsname,
				// password	: file_password
			}, function(res) {

				console.log(res);
				if(res.type == 'success'){
					location.reload();
					console.log('reloading...');
				}else{
console.log('not reloading...');
				}
				// alert(res);

				if (res.status === 403) {
					return;
				}
			});*/
	}
	
});