//Mast.components.DetailsSidebar = Mast.Component.extend({

Mast.registerComponent('DetailsSidebar',{

	events: {
		'click'                              :function(e){e.stopPropagation();},
		'click .activity-tab'                : 'changeToActivityTemplate',
		'click .sharing-tab'                 : 'changeToSharingTemplate',
		'click .version-tab'                 : 'changeToVersionTemplate',
		'click .list-version-tab'            : 'changeToVersionTemplate',
		'click .moreActions-button'          : 'showDropdownAtMore',
		'click .detailsDownload-button'      : 'download',
		'click .close-sidebar'               : 'dismiss',
		'click input.public_link_enabled'    : 'enablePublicLink',
		'click input.public_sublinks_enabled': 'enablePublicSublinks',
		'click input.link_password_enabled'  : 'enableLinkPassword',
		// 'enter input.link_password'     	 : 'changeLinkPassword',//requires enter plugin
		'keyup input.link_password'     	 : 'changeLinkPassword',
		// 'click input.link_password'     	 : 'changeLinkPassword',
		'click .addLinkPassword-button'		 : 'changeLinkPassword',
		'gPressEscape'                       : 'dismiss',
		'clickoutside'                       : 'dismiss',
		'pressEnter'                         : 'rename'
	},

	model: 'Sidebar',

	// keeps track if the activity or sharing tabs are displayed

	template: '.details-sidebar-template',

	bindings: {
		name: function(newVal) {
			this.$el.find('.inode-name').text(newVal);
		}
	},

	subscriptions: {

		'~PUBLIC_LINK_ENABLE': function(event) {
			if (event.source.id == this.model.id) {
				if (event.source.enable == true) {
					this.$el.find('input.public_link_enabled').attr('checked','checked');
					$('.sharing-link-container').css('display','block');
				} else {
					this.$el.find('input.public_link_enabled').removeAttr('checked');
					if (this.model.get('permission')!='admin') {
						$('.sharing-link-container').css('display','none');
					}
				}
			}
		},

		'~PUBLIC_SUBLINKS_ENABLE': function(event) {
			// If the notification was for the directory that we're showing details for,
			// set the checkbox appropriately.
			if (event.source.id == this.model.id) {
				if (event.source.enable == true) {
					this.$el.find('input.public_sublinks_enabled').attr('checked','checked');
				} else {
					this.$el.find('input.public_sublinks_enabled').removeAttr('checked');
				}
			}
		}

	},

	// Update the UI for enabling / disabling public links
	updatePublicLinkOptions: function() {

		console.log(this.iNode.model);

		// For files, check that the public link is enabled,
		// and that the directory its in has public sublinks enabled.
		if (this.iNode.get('type')=='file') {
			if (this.iNode.model.attributes.showPublicLink()) {
				this.$('.public-link').show();
			} else {
				this.$('.public-link').hide();
			}

			if (this.iNode.model.attributes.showPublicLinkOption()) {
				this.$('.public-link-option').show();
			} else {
				this.$('.public-link-option').hide();
			}

			if (this.iNode.model.attributes.showLinkPassword()) {
				this.$('.link-password').show();
				this.$('input.link_password').val(this.iNode.get('link_password'));
			} else {
				this.$('.link-password').hide();
			}

			if (this.iNode.model.attributes.showLinkPasswordOption()) {
				this.$('.link-password-option').show();
			} else {
				this.$('.link-password-option').hide();
			}

			this.$('.public-sublinks-option').hide();
		}

		// For directories, check that public sublinks are enabled.
		else {
			this.$('.public-link').hide();
			this.$('.public-link-option').hide();

			this.$('.link-password').hide();
			this.$('.link-password-option').hide();
			if (this.iNode.model.attributes.showPublicSublinksOption()) {
				this.$('.public-sublinks-option').show();
			} else {
				this.$('.public-sublinks-option').hide();
			}
		}

	},

	// make component for activity tab, sharing tab, and keeps
	// track of activity sharing outlet to use in other function
	afterRender: function() {
		if (this.get('editing')) {
				this.$('.inode-name-input').show();
				this.$('.inode-name').hide();
			}
		else {
			this.$('.inode-name-input').hide();
			this.$('.inode-name').show();
		}

		this.$el.addClass('focus');

	},

	// TODO: documentation
	changeToActivityTemplate: function(e) {

		if (this.get('activeTemplate') == 'activityTemplate') return;
		else {

			this.$el.find('.tab').removeClass('selected');
			this.$el.find('.activity-tab').addClass('selected');
			this.set('activeTemplate', 'activityTemplate',{silent:true});

			if(typeof this.sharingComponent !== 'undefined'){
				this.sharingComponent.close();
			}

			if(typeof this.versionComponent !== 'undefined'){
				this.versionComponent.close();
			}

			this.activityComponent = new Mast.components.ActivityComponent({},this.pattern.model.attributes);

		}

		e.stopPropagation();
	},

	// TODO: documentation
	changeToSharingTemplate: function(e) {

		if (this.get('activeTemplate') == 'sharingTemplate') return;
		else {
			
			this.$el.find('.tab').removeClass('selected');
			this.$el.find('.sharing-tab').addClass('selected');
			this.set('activeTemplate','sharingTemplate',{silent:true});

			this.activityComponent.close();
			// this.versionComponent.close();
			if(typeof this.versionComponent !== 'undefined'){
				this.versionComponent.close();
			}

			this.sharingComponent = new Mast.components.SharingComponent({},this.pattern.model.attributes);
			// Check the public link checkboxes if appropriate
			if (this.model.get('public_link_enabled')) {
				this.$el.find('input.public_link_enabled').attr('checked','checked');
			}
			if (this.model.get('public_sublinks_enabled')) {
				this.$el.find('input.public_sublinks_enabled').attr('checked','checked');
			}
			if (this.model.get('link_password_enabled')) {
				this.$el.find('input.link_password_enabled').attr('checked','checked');
				this.$el.find('div.link-password').hide();
			}
			this.updatePublicLinkOptions();
		}

		e.stopPropagation();
	},

// TODO: documentation
	changeToVersionTemplate: function(e) {

		if (this.get('activeTemplate') == 'versionTemplate') return;
		else {
			this.$el.find('.tab').removeClass('selected');
			this.$el.find('.version-tab').addClass('selected');
			this.set('activeTemplate', 'versionTemplate',{silent:true});
			this.activityComponent.close();
			if(typeof this.sharingComponent !== 'undefined'){
				this.sharingComponent.close();
			}
			this.versionComponent = new Mast.components.VersionComponent({},this.pattern.model.attributes);
		}
		e.stopPropagation();
	},

	/*changeToListVersion: function(e){
		if(this.get('activeTemplate') == '')

	},*/

	// Show  the sidebar and attach the passed-in iNode
	// If the sidebar is already focused on an iNode, deselect it
	focus: function (newINode) {
		newINode.join();
		this.iNode = newINode;
		this.set('mimeClass', this.iNode.get('mimeClass'));
		this.show();
		this.updatePublicLinkOptions();
	},

	// Hide the sidebar, then deselect and detach the iNode
	dismiss: function () {
		if (this.iNode) {
			this.hide();
			this.iNode.deselect();
			this.iNode = null;
		}
	},

	// Display the sidebar
	show: function (newINode) {

		if (!this.get('visible')) {
			// Absorb model from inode and render
			this.set(this.iNode.model.attributes);
			this.set('visible',true,{
				render: this.animateShow
			});
			this.set({editing: false});
		}
		else {
			// Absorb model from inode and render
			this.set(this.iNode.model.attributes,{render: function($old,$new) {
				$old.replaceWith($new);
				this.setElement($new);
				$new.show();
			}});
			this.set({editing: false});
		}

		// Render the appropriate subcomponent
		switch (this.get('activeTemplate')) {

			case 'activityTemplate':

				this.activityComponent && this.activityComponent.close();
				this.activityComponent = new Mast.components.ActivityComponent({},this.model.attributes);
				break;
			
			case 'sharingTemplate':

				this.sharingComponent && this.sharingComponent.close();
				this.sharingComponent = new Mast.components.SharingComponent({},this.model.attributes);
				// Check the public link checkboxes if appropriate
				if (this.model.get('public_link_enabled')) {
					this.$el.find('input.public_link_enabled').attr('checked','checked');
				}
				if (this.model.get('public_sublinks_enabled')) {
					this.$el.find('input.public_sublinks_enabled').attr('checked','checked');
				}
				if (this.model.get('link_password_enabled')) {
					this.$el.find('input.link_password_enabled').attr('checked','checked');
					// this.$el.find('div.link-password-option').show();
					this.$el.find('div.link-password').show();
				}else{
					// this.$el.find('input.link_password_enabled').attr('checked','checked');
					// this.$el.find('div.link-password-option').hide();
					this.$el.find('div.link-password').hide();
				}
				break;

			case 'versionTemplate':

				this.versionComponent && this.versionComponent.close();
				this.versionComponent = new Mast.components.VersionComponent({},this.model.attributes);
				break;

		}
		
		Olympus.ui.fileSystem.set({focus: false});
	},

	// Hide the sidebar
	hide: function () {
		if (this.get('visible')) {
			this.set('visible',false,{
				render: this.animateHide
			});
		}

		Olympus.ui.fileSystem.set({focus: true});
	},

	// Animation for showing this component
	animateShow: function($old,$new) {
		$new.appendTo(this.outlet);
		this.setElement($new);
		var tableWidth = Olympus.ui.activeTable.$el.width(),
		sidebarWidth = 500;

		$old.remove();
		$new.show().css({
			right:-sidebarWidth,
			'z-index':5
		});

		// Hide all but the leftmost column
		if (tableWidth < 1000) {
			Olympus.ui.activeTable.$el.find(this.nonCriticalColumnSelector).fadeOut(100);
		}
		// Or shrink the width of the table
		else {
			Olympus.ui.activeTable.$el.animate({
				width:tableWidth-sidebarWidth
			},200);
		}

		// Animate sidebar
		$new.animate({
			right:0,
			opacity: 1
		},200,function() {
			// Mark table as backgrounded
			Olympus.ui.activeTable.$el.addClass('mast-backgrounded');
		});
	},

	// Animation for hiding this component
	animateHide: function($old,$new) {
		var self = this,
			tableWidth = Olympus.ui.activeTable.$el.width(),
			sidebarWidth = 500;

		// Show all of the columns again
		window.setTimeout(function(){
			Olympus.ui.activeTable.$el.removeClass('mast-backgrounded');
			Olympus.ui.activeTable.$el.find(self.nonCriticalColumnSelector).fadeIn(115);
		},100);
		Olympus.ui.activeTable.$el.animate({
			width:'100%'
		},200);
		$old.animate({
			right: -sidebarWidth
		},200);
	},

	// Selector which returns non-critical columns
	nonCriticalColumnSelector: '.mast-non-critical.mast-column, .mast-non-critical.mast-column-header',

	// Downloads the file. Calls the inode download method.
	download	: function(e) {
		(this.get('type') === 'file') && this.iNode.download(e);
	},

	update		: function() {
		this.set({editing: true});
	},

	'delete'	: function() {
		Mast.Socket.request('/'+this.get('type')+'/delete',{
			id: this.get('id')
		});
		this.hide();
	},

	comment		: function() {

	},

	sharing		: function() {

	},

	// Callback for clicking the "enable link" checkbox
	enablePublicLink : function() {
		Mast.Socket.request('/'+this.get('type')+'/enablePublicLink',
		{
			id			: this.get('id'),		// inode id
			enable	: $('input.public_link_enabled')[0].checked
		});
	},

	// Callback for clicking the "enable links for files / subfolders" checkbox
	enablePublicSublinks : function() {

		Mast.Socket.request('/directory/enablePublicSublinks',
		{
			id			: this.get('id'),		// inode id
			enable	: $('input.public_sublinks_enabled')[0].checked
		});
	},

	enableLinkPassword : function() {
		if($('input.link_password_enabled')[0].checked){
			$('.link-password').slideDown();
		}else{
			$('.link-password').slideUp();
		}

		Mast.Socket.request('/file/enableLinkPassword',
		{
			id 			: this.get('id'),
			enable 		: $('input.link_password_enabled')[0].checked
		});
	},

	changeLinkPassword : function(event) {
		if( (event.type == 'click') || (event.type == 'keyup' && event.keyCode == 13) ){//in case of press enter, removed after save button added

	        if($('input.link_password_enabled')[0].checked){
	        	if($('input.link_password').val() != ''){
					Mast.Socket.request('/file/changeLinkPassword',
					{
						id 			: this.get('id'),
						password 	: $('input.link_password').val()
					},function(res, err){
						// alert('Password saved for the file.');
						if(err){
							alert(err);
						}
						else if(res.success == true){
							alert('Password Updated Successfully.');
						}else{
							console.log('444444444444444444444');
							console.log(err);
							console.log(res);
							console.log('444444444444444444444');
							alert('Some error occurred.');
						}
					});
				}else{
					alert('Password can\'t be empty.');
					if($('input.link_password_enabled')[0].checked){

						//HACK-Actually we need to call disable password on empty but ended up with this
						// $('input.link_password_enabled').trigger('click');
						$("input.link_password_enabled").attr("checked",false);
						this.enableLinkPassword();
						//HACK-END

						$('.link-password').slideUp();
					}
				}
			}
	    }
	}

});
