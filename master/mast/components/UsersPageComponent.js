Mast.registerComponent('UsersPage', {

	model   : 'UserPage',
	template: '.users-page-template',
	outlet  : '#content',

	init: function() {
		this.on('openSidebar', this.createSidebar);
		var lock =  { id : '12' };
		/*Mast.Socket.request('/account/listMembers', lock, function(res, err){
			if(res){
				console.log(res);
			}
		});*/
	},

	regions: {
		'.users-table-region'  : 'UsersTable'
	},

	events: {
		'click .dropdown-button': 'showDropdownAtArrow',
		'contextmenu'           : 'showDropdownAtMousePosition',
	},

	showDropdownAtMousePosition: function(e) {
		this.select(e);
		Olympus.util.dropdownHelper.showDropdownAtMousePosition(e,this,this.get('dropdownItems'));
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

	lockUser: function(event){
		Mast.Socket.request('/account/lockUser', userId, function(res, err){
			if(res){
				console.log(res);
			}
		});
	},

	createSidebar: function(model) {
		this.attach('.users-sidebar-region',
			Mast.components.UserSidebar.extend({
				model: model
			})
		);
	}

});


