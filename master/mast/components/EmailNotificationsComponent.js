Mast.registerComponent('EmailNotifications', {

	model: {

	},

	template: '.email-notifications-template',

	init: function() {

	},

	bindings: {
		download_enabled: function(newVal) {
			this.toggleCheckbox('download-checkmark', newVal);
		},
		upload_enabled: function(newVal) {
			this.toggleCheckbox('upload-checkmark', newVal);
		},
		comment_enabled: function(newVal) {
			this.toggleCheckbox('comment-checkmark', newVal);
		},
		delete_enabled: function(newVal) {
			this.toggleCheckbox('delete-checkmark', newVal);
		}
	},

	// sweet new short hand events
	events: {
		'click .download-checkmark'  : '@download_enabled!',
		'click .upload-checkmark'    : '@upload_enabled!',
		'click .comment-checkmark'   : '@comment_enabled!',
		'click .delete-checkmark'    : '@delete_enabled!',
		'click .notification-updater': 'updateAccountNotifications'
	},

	// Send server request and change the notifiactions of the user
	updateAccountNotifications: function() {
		Mast.Socket.request('/account/update',{
			notifications: {
				download_enabled: this.get('download_enabled'),
				upload_enabled  : this.get('upload_enabled'),
				comment_enabled : this.get('comment_enabled'),
				delete_enabled  : this.get('delete_enabled')
			}
		});
	},

	// Check mark image source will change based on the state of the notification option.
	toggleCheckbox: function (attrName, newVal) {
		var el = this.$("." + attrName);
		if (newVal) {
			el.addClass('active');
			el.attr('src','/images/icon_checkMark_active@2x.png');
		}
		else {
			el.removeClass('active');
			el.attr('src','/images/icon_checkMark_inactive@2x.png');
		}
	}
});
