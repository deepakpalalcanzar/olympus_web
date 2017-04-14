Mast.registerComponent('AddCommentMobile', {
		
	extendsFrom: 'PageMobile',

	beforeCreate: function() {

	},

	regions: {

		// We crate an anonymous component that handles sending the payload to the server.
		'.topbar-region': {

			extendsFrom: 'TopbarMobile',

			// We might write a different template to represent this.
			template: '.topbar-mobile-template',

			events: {
				'touch .submit-comment': 'submitComment'
			},

			// Set the page title and give the action box a create comment action
			beforeCreate: function() {
				this.set(
					{pageTitle: 'New Comment', action: 'submit-comment'},
					{silent: true});
			},

			submitComment: function() {

				var self = this;

				this.$('.submit-comment').removeClass('tapped');


				// This line is confusing. I feel like a some sort of object whos only job is to pass data.
				// between components.
				// We get the child at .main-ui-region of the parent and call its get payload
				// function that we will return to the server
				var commentPayload = this.parent.child('.main-ui-region').getPayload();
				var type = this.parent.get('type');

				// Give a request to the server to add this comment with these request parameters.
				Mast.Socket.request('/' + type +'/addComment',{
					id: this.parent.get('id'),
					payload: commentPayload
				}, function(res) {

					// navigate back to the inode specifics page
					Mast.navigate('#specifics/' + self.parent.get('type') + '/' + self.parent.get('id'));
				});
			}

		},

		// In here we have out logic for the textarea that the user will use to enter there comment.
		'.main-ui-region': {

			template: '.add-comment-mobile-template',

			beforeCreate: function() {
				this.set(
					{
						type     : this.parent.get('type'),
						id       : this.parent.get('id')
					}, {silent: true});
			},

			// Get the value of the input that the user has entered.
			getPayload: function() {
				return this.$('input').val();
			}
		}
	}

	
	
});