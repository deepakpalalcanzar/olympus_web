Mast.registerComponent('DialogComponent', {

	model: Mast.Model.extend({
		defaults: function () {
			return {
				pathName: Olympus.ui.fileSystem.pwd.computePath(),
				enabled : false,
				uploading: false
			};
		}
	}),

	regions: {
		'.uploader': 'Uploader'
	},

	bindings: {
// Displayed/hides the ajax spinner if user is uploading or finished uploading file.
		uploading: function(newVal) {
			if (newVal) {
				this.$('.loading-spinner').show();
			} else {
				this.$('.loading-spinner').hide();
			}
		},

//  Fade in/out submit button based on value of "enabled" attribute.
//  
		enabled: function(newVal){
			var uploadButton = this.$(".upload-button");
			if (newVal) {
				uploadButton.removeClass('no-submit');
				uploadButton.addClass('submit');
			} else {
				uploadButton.removeClass('submit');
				uploadButton.addClass('no-submit');
			}
		}

	},

	init: function(){

		var self = this;
		this.on('addFile',function(files){
			var parentId = Olympus.ui.fileSystem.pwd.get('id');
			// Mast.Socket.request('/file/size', { size: files[0].size, workgroup_id: parentId}, function(res, err){
				// if((res[0].remainingQuota - files[0].size) > 0){
					self.set('enabled',true);
					self.setInputValue(files);
				// }else{
					// alert("Your file upload exceeded then your quota limit.");
				// }
			// });
		}); 

		this.on('uploadComplete',this.afterUpload);

	},

	events: {
		// 'click': function(e) {e.stopPropagation();},
		'click .cancel'       : 'closeDialog',
		'click .submit'       : 'submit'
	},

// Create jquery UI dialog and properly position it.
	afterRender: function() {
		this.$el.dialog({
			closeOnEscape: true,
			resizeable   : false,
			draggable    : false,
			modal        : true,
			width        : 450
		}).dialog('widget').position({
			my: 'bottom',
			at: 'center',
			of: $(window)
		});
	},

// sets the input value to the name of the file. The file coming is an array
	setInputValue: function(file) {
		this.$('.popup-box-input').val(file[0].name);
	},
	
// Begin uploading: Fire submit event in file uploader and pass in data
	submit: function () {

		// var parentId = Olympus.ui.fileSystem.pwd.get('id');
		var parentId = Olympus.ui.fileSystem.pwd.get('id');
		this.$('.loading-spinner').show();
		this.$('.loading-spinner').css({"position": "relative", "left":"0px", "top" : "-165px"});
//Trigger a submit event and pass useful data to the uploader.
		this.children['.uploader'].trigger('submit',{
			id: parentId,
			parent: {
				id: parentId
			}
		});

		this.set('enabled', false);
		this.set('uploading', true);

	},

// After the entire upload process is complete, we change the upload status.
	afterUpload: function () {
		//this.set('uploading', false);
		this.$('.loading-spinner').hide();
		this.closeDialog();
	},

	beforeClose: function() {
		this.$el.dialog('destroy');
	},

// Removes all refernces to the dialog component and removes it from the DOM.
	closeDialog: function() {
		this.close();
	}

});
