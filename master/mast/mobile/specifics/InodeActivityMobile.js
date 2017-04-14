// Comment tree
Mast.registerTree('InodeActivityMobile', {

	template: '.inode-activity-mobile-template',

	branchComponent: 'InodeActivityItemMobile',

	branchOutlet: '.inode-activity-items-region',

	collection: {
		model: {}
	},

	// emptyHTML: 'no activity at this time',
	emptyHTML: '<div class="emptyHTML">There is no activity.</div>',

	loadingHTML: '<div class="loading-spinner"></div>',

	subscriptions: {

		// add the created comment to the inode activity list
		'~COMMENT_CREATE': function (comment) {
			if (comment && comment.source && comment.source.item &&
				comment.source.item.id == this.get('id') &&
				comment.source.item.type == this.get('type')) {
				this.collection.add(comment.source);
				// this.scrollToBottom();
			}
		}
	},

	// Inherit model from parent
	beforeCreate: function() {
		this.set(this.parent.model.attributes, {silent: true});
	},

	afterCreate: function() {
		//  Set the collection to pull from the comments for this model
		this.collection.url = '/'+this.get('type')+'/activity/'+this.get('id');
		this.collection.fetch();
	},

	// scroll to the new comment when it is created
	scrollToBottom: function() {
		var commentStream = $('.commentRow-outlet');
		commentStream && commentStream[0] &&
			commentStream.scrollTop(commentStream[0].scrollHeight);
	}

	
});

// Individual comment
Mast.registerComponent('InodeActivityItemMobile', {
	template: '.inode-activity-item-mobile-template',

	// Inherit model from parent
	beforeCreate: function() {
		this.marshalActivityData(); 
	},

	// Marshal server side data intoto presentable format.
	marshalActivityData: function() {
		this.set({
			created_at: moment(new Date(this.get('created_at'))).fromNow()
		}, {silent: true});
	}
});