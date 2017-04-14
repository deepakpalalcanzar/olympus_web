Mast.registerComponent('VersionRow',{
	template: '.versionRow-template',
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
Mast.registerTree('VersionList', {

	_class         : 'VersionList',
	template       : '.inodeVersion-template',
	outlet         : '.check-version-outlet',
	emptyHTML      : '<span class="no-activity">There no version of this file.</span>',
	collection     : 'Versions',
	branchOutlet   : '.versionRow-outlet',
	branchComponent: 'VersionRow',

	subscriptions: {
		//Below subscription prevents Activity Comment List to function correctly
		//TEST CASE:
		//1.click on Activity(/Comment) tab
		//2.comment-(comment rendered immediately)
		//3.Click on Version Tab
		//4.Click again in Activity(/Comment) tab
		//5.Again Comment -This time comment posted in backend but did not render immediately
		//Actually in Activity comments are updated with ActivityList components' subscription but 
		//for Version tab comments are loaded from collection each time Version tab is clicked but 
		//but on comment a new static row is added immediately
		/*'~COMMENT_CREATE': function (comment) {
			if (comment && comment.source && comment.source.item &&
				// comment.source.item.id == this.get('id') &&
				comment.source.item.type == this.get('type')) {

				var html='';
				// console.log(val);
				html+='<div class="commentRow-template comment-attire">'+
					  '<div class="comment-user-avatar">'+
					  '<a href="#" class="user-avatar-link">'+
					  '<img class="user-avatar" src="'+comment.source.modified_by.avatar+'"></a></div>'+
					  '<div class="comment-container">'+
                      '<h6><a href="#">'+comment.source.modified_by.name+'</a></h6>'+
					  '<span class="comment-date">'+comment.source.modified_at+'</span>'+
					  '<p class="details-text">'+comment.source.message+'</p></div>'+
					  '<div class="clear-tab"></div><div class="comment-border"></div>'+
					  '</div>';
				
				console.log('vers-comm-length'+$('#vers-com').length)
				$('#vers-com').append(html).show();

				// this.collection.add(comment.source);
				// this.scrollToBottom();
			}
		}*/
	},

	events: {
		'click .postVersion-button': 'postVersion',
		'pressEnter'               : 'postVersion',
		'resize'                   : 'resizeVersionSection',
		'click .span-delete'  	   : 'deleteFile',
		'click .span-comment'  	   : 'comment',
	},

	init: function() {
		var self = this;
		this.collection.listVersion(this.pattern.model.attributes,function(err, res){
			self.scrollAtBottom();
		});
		$(window).on('resize', this.resizeVersionSection);

		/* For number comment*/
		Mast.Socket.request('/file/version', {id:this.model.id}, function(resp, err){
			$.each(resp, function( i, val ) {
				Mast.Socket.request('/file/numVersionComment', { id: val.id}, function(res, err){
					$('.comm-num-'+val.id).html(res[0].num_ver_comment);
				});
			});
		});
		/* For number comment*/
	},

	deleteFile: function(event){

		Mast.Socket.request('/'+this.get('type')+'/delete',{
			id: event.target.id
		}, function(response){
			if (response===403) {
				alert('Permission denied. You do not have sufficient permissions to delete this item.');
			} else {

				// Olympus.ui.fileSystem;
				Mast.navigate('index');
				// this.trigger('afterRender');
				// $("#version_"+response.obj.id).parent().remove();
//				$('#fileSystem-outlet').load(
					/*Mast.components.FileSystem({
						outlet	: '#content'
					})*/
//				);

			}
		});
	},

	comment: function(event){
		$(".versionRow-template").children().not("#version_"+event.target.id).hide();
		$('.versionRow-template').removeClass('comment-attire');
		$("#version_"+event.target.id).parent().addClass('comment-attire');
		$("#version_"+event.target.id).parent().css('padding', '39px 0px');
		$('.postVersion-button').attr('id',event.target.id); // by alcanzar

		//Show version comment Afzal
		$('#vers-comm-form').show();

		// $('.versionCommentRow-outlet').load(
			// Mast.components.ActivityRow({
			// 	outlet	: '.commentRow-outlet'
			// })
		// );
		Mast.Socket.request('/'+this.get('type')+'/getVersionComment',{
			id: event.target.id
		}, function(response){
			if (response===403) {
				alert('Permission denied. You do not have sufficient permissions to see this item.');
			} else {
				if(response.length){
					var html='';
					$.each(response, function(i,val){
						html+='<div class="commentRow-template comment-attire">'+
							  '<div class="comment-user-avatar">'+
							  '<a href="#" class="user-avatar-link">'+
							  '<img class="user-avatar" src="'+((val.avatar_image == null)?'/images/39.png':'/images/profile/'+val.avatar_image)+'"></a></div>'+
							  '<div class="comment-container">'+
		                      '<h6><a href="#">'+val.name+'</a></h6>'+
							  '<span class="comment-date">'+val.comm_date+'</span>'+
							  '<p class="details-text">'+val.payload+'</p></div>'+
							  '<div class="clear-tab"></div><div class="comment-border"></div>'+
							  '</div>';
					});
					
					$('#vers-com').html(html).show();
				}else{
					$('#vers-com').html('<span class="no-activity">There are no recent comments.</span>').show();
				}
			}
		});
	},

	afterRender: function() {

		var self = this;
// Wait until call stack is cleared to resize comment section
// (otherwise, DOM will not elements from parent components yet)
		window.setTimeout(function() {
			self.resizeVersionSection();
		},5);
	},

	// post a comment
	postVersion: function(e, f) {

		console.log(this.$('.postVersion-button').attr('id'));
		// console.log(this.collection.models);
		//console.log(this.collection.models.id);
	
		var val = this.$('textarea').val();
		//var check = $('span').hasClass('span-comment').attr('id');
		// console.log(this);
		// Argument f is the raw jquery event object and we need it to prevent new line characters
		// form inserting to the textarea on pressEnter.
		f && f.preventDefault();
		console.log(f);
		var commentPayload = this.getCommentPayload();

		// prevent empty comments
		if (commentPayload.match(/^\s*$/) !== null) {
			return;
		}

		// Clear comment textarea
		this.$('textarea').val('');

		// Submit comment to server
		Mast.Socket.request(this.getUrlRoot()+'addComment',{
			id: this.$('.postVersion-button').attr('id'),
			payload: commentPayload
		}, function(res) {
			$('.span-comment:visible').trigger('click');
			$('.span-comment:visible').html(1+parseInt($('.span-comment:visible').html()));
		});
	},

	// Fetch and clear the contents of the textarea
	getCommentPayload: function() {
		return this.$('textarea').val();
	},

	resizeVersionSection: function() {
		var sectionHeight = this.sectionHeight =
		$('.details-sidebar').innerHeight() -
		$('.top-container').innerHeight() -
		$('.activity-search-headers').innerHeight() -
		$('.currently-viewing').innerHeight()  -
		$('.comment-form').innerHeight();
		this.$('.versionRow-outlet').height(sectionHeight);
		this.$('.versionRow-outlet').css('max-height', sectionHeight + 'px');
	},

	// scroll to the new comment when it is created
	scrollAtBottom: function() {
		var commentStream = $('.versionRow-outlet');
		commentStream && commentStream[0] &&
			commentStream.scrollTop(commentStream[0].scrollHeight);
	},
	
	getUrlRoot: function () {
		return "/"+this.get('type')+"/";
	},

	// Select this iNode, join the conversation, and open the sidebar
	select: function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();

		// If there is a dropdown, close it
		if (Olympus.ui.dropdown){
			Olympus.ui.dropdown.hide();
		}

		if (Olympus.ui.detailsSidebar.get('visible')){
			Olympus.ui.detailsSidebar.focus(this);
		}

		// If the inode is already selected, return out
		if (this.get('selected')) return;

		// First deselect currently selected inode if it is actually an Inode
		// This will not call deselect if the pwd refers to the fileSystem (pwd is at the root)
		Olympus.ui.fileSystem.get('selectedInode') &&
			Olympus.ui.fileSystem.get('selectedInode').deselect();

		// Set the selected inode for the filesystem and set this inode's state to selected
		Olympus.ui.fileSystem.set({selectedInode: this}, {silent: true});
		this.set({selected: true});

		this.join();

		// If inode is a file then set the pwd to the parent directory,
		// otherwise change it to that selected directory inode
		if (this.get('type') === 'file') {
			Olympus.ui.fileSystem.cd(this.parent);
		} else {
			Olympus.ui.fileSystem.cd(this);
		}
	},
	
	// Deselect this iNode and leave the conversation
	deselect: function () {

		Olympus.ui.fileSystem.cd(Olympus.ui.fileSystem);
		if (!this.get('selected')) return;
		this.set('selected',false,{
			render: function($old,$new) {
				$old.removeClass('selected');
			}
		});
		
		this.leave();
		
	},
	
	// Mark current user's account as active in this directory
	join: function (){
		if (!this.currentUserJoined) {
			this.currentUserJoined = true;
			Mast.Socket.request('/'+this.get('type')+'/join',{
				id: this.get('id')
			});
		}
	},

	// Mark current user's account as inactive in this directory
	leave: function (){
		if (this.currentUserJoined) {
			this.currentUserJoined = false;
			Mast.Socket.request('/' + this.get('type') + '/leave',{
				id: this.get('id')
			});
		}
	},



});
