Mast.registerComponent('AccountSettingsMobile', {
		
	extendsFrom: 'PageMobile',

	regions: {

		'.topbar-region': {

			model: {
				pageTitle: 'Settings',
				// activeTab: 'profile',
				// action   : 'edit-profile'
				action   : null
			},

			template: '.topbar-mobile-template',

			// bindings: {

			// 	// sets the action attribute based on the active tab the user is on
			// 	activeTab: function(newVal) {
			// 		if (newVal === 'profile') {
			// 			this.set('action', 'edit-profile');
			// 		} else {
			// 			this.set('action', null);	
			// 		}
			// 	},

			// 	action: function(newVal) {
			// 		if (newVal === 'edit-profile') {
			// 			this.$('.action-box').removeClass('edit-profile');
			// 		} 
			// 	}
			// },

			events: {
				'touch .edit-profile': 'editProfile'
			},

			afterCreate: function() {
				OlympusHelper.touchEnhance(this.$('.edit-profile'));
			},

			editProfile: function() {
				this.parent.attach('.main-ui-region', EditProfileMobile);
			},

			regions: {
				'.nav-region': 'NavMobile'
			}
		},

		'.main-ui-region': {

			template: '.account-settings-mobile-template',

			events: {
				'touch ul .profile' : 'viewProfile',
				'touch ul .password': 'viewPassword',
				'touch ul .alerts'  : 'viewAlerts'
			},

			regions: {
				'.selected-tab-content-region': 'AccountProfileMobile'
			},

			afterCreate: function() {
				this.$('> ul').bind('touchmove', function(e) { e.preventDefault(); });
				OlympusHelper.touchEnhance(this.$('ul li.profile'));
				OlympusHelper.touchEnhance(this.$('ul li.password'));
				OlympusHelper.touchEnhance(this.$('ul li.alerts'));
			},

			// Attaches the account profile component
			viewProfile: function() {
				this.attach('.selected-tab-content-region', 'AccountProfileMobile');

				// set the topbars active tab to to be profile
				// this.parent.child('.topbar-region').set('activeTab', 'profile');
				this.$('ul li').removeClass('tapped');
			},

			// Attaches the account password component
			viewPassword: function() {
				this.attach('.selected-tab-content-region', 'AccountPasswordMobile');

				// set the topbars active tab to to be password
				// this.parent.child('.topbar-region').set('activeTab', 'password');
				this.$('ul li').removeClass('tapped');
			},

			// Attaches the account alerts component
			viewAlerts: function() {
				this.attach('.selected-tab-content-region', 'AccountAlertsMobile');
				this.$('ul li').removeClass('tapped');
			}

		}
	}
	
});