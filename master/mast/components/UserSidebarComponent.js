Mast.registerComponent('UserSidebar', {

	template: '.user-sidebar-template',
	outlet: '#content',

	events: {
		'click .close-sidebar'   : 'closeUserSidebar',
		'click .user-name'       : 'editUserName',
		'click .user-title'      : 'editUserTitle',
		'click .user-email'      : 'editUserEmail',
		'click .user-phonenumber': 'editUserPhonenumber',
		'click .user-name'       : 'updateInfo',
		'click .lock-account-button' : 'lockAccount',
		'click .delete-account-button' : 'del'
	},

	// close the sidebar
	closeUserSidebar: function() {
		this.parent.set({sidebarDisplayed: false});
		$('.users-table-region').css("width", "1284px");
		this.close();
	},

	lockAccount: function(){

		var lock =  { 
			id : this.model.id,
			lock : true
		};
		Mast.Socket.request('/account/lockAccount', lock, function(res, err){
			if(res){
				console.log(res);
			}
		});
	},

	del: function(){
			
		console.log(this);
		var lock =  { id : this.model.id };
		Mast.Socket.request('/account/delAccount', lock, function(res, err){
			if(res.status = "ok"){
				location.reload();
			}
		});

	},

	updateInfo: function(){
		this.parent.set({sidebarDisplayed: true});
	},

	//autoRender: false,

	editUserName: function() {
		this.parent.set({sidebarDisplayed: true});
		alert(this.get('activeTemplate'));
	},

	editUserTitle: function() {
		this.parent.set({sidebarDisplayed: true});
	},

	editUserEmail: function() {
		this.parent.set({sidebarDisplayed: true});
	},

	editUserPhonenumber: function() {
		this.parent.set({sidebarDisplayed: true});
	},

// Show the sidebar with an animation
	animateSidebarShow: function() {
		this.parent.set({sidebarDisplayed: true});
	},

// Hide the sidbar with an animation
	animateSidebarHide: function() {
		this.parent.set({sidebarDisplayed: true});
	},

});