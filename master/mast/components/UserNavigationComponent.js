Mast.registerComponent('UserNavigationComponent', {

	template: '.user-nav-template',
	outlet  : '#user-nav-outlet',
	model	: 'UserNavigation',
	autoRender: false,


	beforeRender:function() {
		Mast.Socket.request('/account/getImage', { pic_type: 'profile'}, function(res, err, next) {
			if(res.avatar !== '' && res.avatar!== null){
				$('.user-avatar').attr('src', "/images/profile/"+res.avatar);			
			}
		});
	},

	afterRender: function() {	

		var self = this;
		Olympus.ui.fileSystem.on('cd', this.updateButtonState);
		Mast.Socket.request('/account/getImage', { pic_type: 'profile'}, function(res, err, next) {
			if(res){
				if(res.avatar !== '' && res.avatar!== null){
					$('.user-avatar').attr('src', "/images/profile/"+res.avatar);			
				}
				if(self.get('showMenus')){
					self.updateNavDropDown();
				}
			}
		});
	},

	events: {
		'click .dropdown-button': 'showDropdown'
	},


	updateNavDropDown: function(){
		this.set('showMenus', false);
		var d = this.get('dropdownItems');
		//if(Mast.Session.Account.isAdmin && Mast.Session.Account.isSuperAdmin === 1)
		if(Mast.Session.Account.isAdmin=="" && Mast.Session.Account.isSuperAdmin !== 1){ //Avneesh
			if(Mast.Session.Account.isLdapUser || Mast.Session.Account.isADUser){
				d.splice('1', '4');
			}else{
				d.splice('2', '3');
			}
		}else if (Mast.Session.Account.isEnterprise === 1){
			d.splice('4', '1');
		}else if (Mast.Session.Account.isSuperAdmin === 1){
			d.splice('5', '1');//no subscriptions aplies to superadmin
		}
	},

	// create global dropdown instance and place it at the drop down button
	// on the user navigation component
	showDropdown: function(e) {

		// $('.inode-template.selected').removeClass('selected');
		Olympus.util.dropdownHelper.showDropdownAt(this.$(".dropdown-button"),-126,25,e,this,this.get('dropdownItems'));
		$('.dropdownActions-outlet').css({'background': "" + $('#body_bg_color').html() });
	},

	// navigate to the acounts detail page
	viewProfile: function() {
		Mast.navigate('#account/details');
	},

	password: function() {
		Mast.navigate('#account/password');
	},

	notifications: function() {
		Mast.navigate('#account/notifications');
	},

	settings: function(){
		Mast.navigate('#account/settings');
	},

	systemSettings: function(){
		Mast.navigate('#account/systemsettings');
	},

	appearance: function(){
		Mast.navigate('#account/appearance');
	},


	// Sign out of the session
	signOut: function() {
		window.location = 'auth/logout';
	},

	// When the session information from the server is available
	afterConnect: function() {
		this.set(Mast.Session.Account);
	},

	subscription: function() {
		Mast.navigate('#account/subscription');
	},

});
