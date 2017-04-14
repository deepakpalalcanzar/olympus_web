Mast.registerComponent('InodeSpecificsMobile', {

	extendsFrom: 'PageMobile',

	regions: {

		// Top navigation bar
		'.topbar-region': {

			extendsFrom: 'TopbarMobile',

			template: '.topbar-specifics-mobile-template',

			// Get name of inode and use that as the page title, as well as the type and the id of the
			// inode so we can use them in the add permission and add comment
			beforeCreate: function() {
				this.set(
					{
						pageTitle: this.parent.get('name'),
						type     : this.parent.get('type'),
						id       : this.parent.get('id')
					}, {silent: true});
			},

			// touch events for the inode specific add permission and add comment boxes
			events: {
				'touch .add-permission-box': 'navigateAddPermission',
				'touch .add-comment-box'   : 'navigateAddComment'
			},

			// Navigates to the add permission route passing in the type of the inode as well as the 
			// inode id. We will use these two arguments to read and update the permissions of this
			// inode.
			navigateAddPermission: function() {
				console.log(this.get('type'), this.get('id'));
				Mast.navigate('#addPermission/' + this.get('type') + '/' + this.get('id'));
				this.$('.add-user-box').removeClass('tapped');
			},

			// Navigate to the add comment route passing in the type of the inode as well as the 
			// inode id. We will use these two arguments to read and update the comments of this
			// inode.
			navigateAddComment: function() {
				Mast.navigate('#addComment/' + this.get('type') + '/' + this.get('id'));
				this.$('.add-comment-box').removeClass('tapped');
			}


		},


		// Main UI region for visualizing the specifics
		'.main-ui-region': {

			template: '.inode-specifics-mobile-template',

			regions: {
				'.selected-tab-content-region': 'InodeDetailsMobile'
			},

			events: {
				'touch ul .details' : 'viewDetails',
				'touch ul .activity': 'viewActivity',
				'touch ul .sharing' : 'viewSharing'
			},

			// Prevent touchstart on anything that doen't stopPropagation
			// (this makes things feel more native)
			afterCreate: function() {
				this.$('> ul').bind('touchmove', function(e) { e.preventDefault(); });
				OlympusHelper.touchEnhance(this.$('ul li.details'));
				OlympusHelper.touchEnhance(this.$('ul li.activity'));
				OlympusHelper.touchEnhance(this.$('ul li.sharing'));
			},

			// Inherit model from parent which is the inode that was touched
			beforeCreate: function() {
				this.set(this.parent.model.attributes, {silent: true});
			},

			// Attaches the inode details component
			viewDetails: function() {
				this.attach('.selected-tab-content-region', 'InodeDetailsMobile');
				this.$('ul li').removeClass('tapped');
			},

			// Attaches the inode activity component
			viewActivity: function() {
				this.attach('.selected-tab-content-region', 'InodeActivityMobile');
				this.$('ul li').removeClass('tapped');
			},

			// Attaches the inode sharing component
			viewSharing: function() {
				this.attach('.selected-tab-content-region', 'InodeSharingMobile');
				this.$('ul li').removeClass('tapped');
			}
		}
	},

	// Fetch model, but only if necessary
	beforeCreate: function() {
		if (!this.get('id')) {
			throw new Error ('No id provided!');
		}
		this.model.urlRoot = '/'+this.get('type');

		// Fetch model and join room
		async.auto({
			fetch: this.asyncFetch,
			join: this.asyncJoin
		}, this.afterFetch);
	},

	// Do a fetch in an async block
	asyncFetch: function (cb) {
		this.model.fetch({success: function () { cb();	} });
	},

	// Do a room join in an async block
	asyncJoin: function (cb) {
		Mast.Socket.request('/'+this.get('type')+'/join/'+this.get('id'), {}, function () {
			cb();
		});
	},

	// When the server operations are complete, render the component
	afterFetch: function(err) {
		if (err) throw err;

		this.marshalInodeData();
		// this.append();
	},

	// autoRender: false,

	marshalInodeData: function() {
		
		this.set({
			modified_at: moment(new Date(this.get('modified_at'))).fromNow()
		}, {silent:true});
	}

});