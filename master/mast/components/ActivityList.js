Mast.registerComponent('ActivityRow',{
	template: '.commentRow-template',
	afterCreate: function () {

		// Decorate links with <a> tags
		// var withProtocol = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		// var withoutProtocol = /(\b[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		var urlExpression = /(((https?|ftp|file):\/\/)?([A-Z,0-9,a-z]+\.)+[A-Z,0-9,a-z]+[?\/]?(.+)*)/ig;

		var linkTemplate = '<a target="_blank" href="$1">$1</a>';
		var message = this.get('message').replace(urlExpression,linkTemplate);
		this.$('.details-text').html(message);
		// Make sure protocol exists to make link external
		this.$('.details-text a').each(function(){
			var href = $(this).attr('href');
			if (href && !href.match(/(https?|ftp|file):\/\//)) {
				$(this).attr('href',"http://"+href);
			}
		});
	}
});

// inode activity list component
Mast.registerTree('ActivityList', {
	
	_class         : 'ActivityList',
	template       : '.inodeComments-template',
	outlet         : '.viewers-activity-outlet',
	emptyHTML      : '<span class="no-activity">There are no recent comments.</span>',
	collection     : 'Activities',
	branchOutlet   : '.commentRow-outlet',
	branchComponent: 'ActivityRow',

	subscriptions: {
		/*Rishabh-Removing This subscription as it is not adding comment on correct tree */
		'~COMMENT_CREATE': function (comment) {
			// alert('TEST');
                        if(Mast.Session.Account.avatar_image==null){
                           var avatar_image="/images/avatar_anonymous.png";
                        }else{
                         var avatar_image=  '/images/profile/'+Mast.Session.Account.avatar_image
                        }
                   
			if (comment && comment.source && comment.source.item &&
				comment.source.item.id == this.get('id') &&
				comment.source.item.type == this.get('type')) {
				console.log(comment);
				comment.source.created_by.avatar = avatar_image;
				this.collection.add(comment.source);
				this.scrollToBottom();
			}else{
				console.log('COMMENTDETAILSNOTFOUND');
				console.log(comment);
			}
		}
	},

	events: {
		'click .postComment-button': 'postComment',
		'pressEnter'               : 'postComment',
		'resize'                   : 'resizeCommentSection'
	},

	init: function() {


		this.set({ url :  String( window.location ).replace( /#/, "" ) });
		var self = this;
		this.collection.load(this.pattern.model.attributes,function(){
			self.scrollToBottom();
		});
		$(window).on('resize', this.resizeCommentSection);

		Mast.Socket.request('/account/getImage', {pic_type: 'profile'}, function (res, err, next) {
                       if (res.avatar !== '' && res.avatar !== null) {
                            Mast.Session.Account.avatar_image= res.avatar;
                       }
                });

	},

	afterRender: function() {
		var self = this;

		// Wait until call stack is cleared to resize comment section
		// (otherwise, DOM will not elements from parent components yet)
		window.setTimeout(function() {
			self.resizeCommentSection();
		},5);
	},

	// post a comment
	postComment: function(e, f) {

		// Argument f is the raw jquery event object and we need it to prevent new line characters
		// form inserting to the textarea on pressEnter.
		f && f.preventDefault();
		var commentPayload = this.getCommentPayload();

		// prevent empty comments
		if (commentPayload.match(/^\s*$/) !== null) {
			return;
		}

		// Clear comment textarea
		this.$('textarea').val('');
		
		// Submit comment to server
		Mast.Socket.request(this.getUrlRoot()+'addComment',{
			id: this.get('id'),
			payload: commentPayload
		}, function(res) {});
	},

	// Fetch and clear the contents of the textarea
	getCommentPayload: function() {
		return this.$('textarea').val();
	},

	resizeCommentSection: function() {
		var sectionHeight = this.sectionHeight =
		$('.details-sidebar').innerHeight() -
		$('.top-container').innerHeight() -
		$('.activity-search-headers').innerHeight() -
		$('.currently-viewing').innerHeight()  -
		$('.comment-form').innerHeight();
		this.$('.commentRow-outlet').height(sectionHeight);
		this.$('.commentRow-outlet').css('max-height', sectionHeight + 'px');
	},

	// scroll to the new comment when it is created
	scrollToBottom: function() {

		var commentStream = $('.commentRow-outlet');
		commentStream && commentStream[0] &&
			commentStream.scrollTop(commentStream[0].scrollHeight);
	},
	
	getUrlRoot: function () {
		return "/"+this.get('type')+"/";
	}
});
